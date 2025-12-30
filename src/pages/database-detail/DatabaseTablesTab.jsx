import {
  Database,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  Table as TableIcon,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings,
  Code,
  Edit,
  Save,
  Upload,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import ConfirmModal from "../../components/ui/ConfirmModal";
import TableStructureModal from "./TableStructureModal";
import { useState, useEffect } from "react";
import { authApis, endpoints } from "../../config/api.config";
import { useToast } from "../../contexts/ToastContext";

export default function DatabaseTablesTab({ dbId, databaseName }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewDataModalOpen, setIsViewDataModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [tableStructure, setTableStructure] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [structureLoading, setStructureLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [rowActionLoading, setRowActionLoading] = useState(false);
  const [dataPage, setDataPage] = useState(0);
  const [dataPageSize] = useState(10);
  const [activeStructureTab, setActiveStructureTab] = useState("view");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [rowModalMode, setRowModalMode] = useState("add"); // 'add' or 'edit'
  const [editingRow, setEditingRow] = useState(null);
  const [rowFormData, setRowFormData] = useState({});
  const [rowFormError, setRowFormError] = useState(""); // Error message for row form
  const { addToast } = useToast();

  // Structure modification state
  const [structureChanges, setStructureChanges] = useState({
    addColumns: [],
    dropColumns: [],
    modifyColumns: [],
  });

  // New column form
  const [newColumn, setNewColumn] = useState({
    name: "",
    type: "varchar",
    length: "",
    constraints: "",
    defaultValue: "",
  });

  // Form state for creating table
  const [formData, setFormData] = useState({
    tableName: "",
    columns: [
      {
        name: "id",
        type: "serial",
        constraints: "Primary Key",
        foreignKeyTable: "",
        foreignKeyColumn: "",
        onDelete: "",
        onUpdate: "",
        length: "",
      },
    ],
  });

  // State for foreign key reference columns
  const [foreignKeyColumnsMap, setForeignKeyColumnsMap] = useState({});

  const columnTypes = [
    "serial",
    "integer",
    "int",
    "bigint",
    "string",
    "varchar",
    "text",
    "boolean",
    "bool",
    "date",
    "datetime",
    "timestamp",
    "decimal",
    "float",
    "double",
    "json",
  ];

  const constraintOptions = ["Primary Key", "Not Null", "Unique", ""];

  const cascadeOptions = ["CASCADE", "SET NULL", "RESTRICT", "NO ACTION", ""];

  // Fetch tables
  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(endpoints.databaseTables(dbId));
      if (response.data.code === 200) {
        setTables(response.data.data || []);
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch foreign key columns for a table
  const fetchForeignKeyColumns = async (tableName) => {
    if (!tableName) return;

    try {
      const response = await authApis().get(
        endpoints.getTableColumns(dbId, tableName)
      );
      if (response.data.code === 200) {
        setForeignKeyColumnsMap((prev) => ({
          ...prev,
          [tableName]: response.data.data || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching foreign key columns:", error);
      addToast(
        error.response?.data?.message || "Không thể lấy danh sách cột",
        "error"
      );
    }
  };

  // Add new column
  const addColumn = () => {
    setFormData({
      ...formData,
      columns: [
        ...formData.columns,
        {
          name: "",
          type: "integer",
          constraints: "",
          foreignKeyTable: "",
          foreignKeyColumn: "",
          onDelete: "",
          onUpdate: "",
          length: "",
        },
      ],
    });
  };

  // Remove column
  const removeColumn = (index) => {
    const newColumns = formData.columns.filter((_, i) => i !== index);
    setFormData({ ...formData, columns: newColumns });
  };

  // Update column field
  const updateColumn = (index, field, value) => {
    const newColumns = [...formData.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };

    // If updating foreignKeyTable, fetch columns for that table
    if (field === "foreignKeyTable") {
      if (value) {
        fetchForeignKeyColumns(value);
      }
      // Reset foreignKeyColumn when table changes
      newColumns[index].foreignKeyColumn = "";
    }

    setFormData({ ...formData, columns: newColumns });
  };

  // Create table
  const handleCreateTable = async (e) => {
    e.preventDefault();

    if (!formData.tableName.trim()) {
      addToast("Vui lòng nhập tên bảng", "error");
      return;
    }

    if (formData.columns.length === 0) {
      addToast("Bảng phải có ít nhất 1 cột", "error");
      return;
    }

    // Validate columns
    for (let i = 0; i < formData.columns.length; i++) {
      const col = formData.columns[i];
      if (!col.name.trim()) {
        addToast(`Cột ${i + 1}: Vui lòng nhập tên cột`, "error");
        return;
      }
      if (col.type === "varchar" && !col.length) {
        addToast(`Cột ${col.name}: Varchar phải có độ dài (length)`, "error");
        return;
      }
    }

    try {
      setCreateLoading(true);

      // Format data theo API yêu cầu
      const requestData = {
        tableName: formData.tableName.trim(),
        columns: formData.columns.map((col) => {
          const column = {
            name: col.name.trim(),
            type: col.type,
          };

          // Add optional fields only if they have values
          if (col.constraints) column.constraints = col.constraints;
          if (col.length) column.length = parseInt(col.length);
          if (col.foreignKeyTable) column.foreignKeyTable = col.foreignKeyTable;
          if (col.foreignKeyColumn)
            column.foreignKeyColumn = col.foreignKeyColumn;
          if (col.onDelete) column.onDelete = col.onDelete;
          if (col.onUpdate) column.onUpdate = col.onUpdate;

          return column;
        }),
      };

      const response = await authApis().post(
        endpoints.createTable(dbId),
        requestData
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Tạo bảng thành công!", "success");
        setIsCreateModalOpen(false);
        resetForm();
        fetchTables();
      } else {
        addToast(response.data.message || "Tạo bảng thất bại", "error");
      }
    } catch (error) {
      // Hiển thị lỗi chi tiết từ API
      let errorMsg = "Đã có lỗi xảy ra khi tạo bảng";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      addToast(errorMsg, "error");
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete table
  const handleDeleteTable = async () => {
    if (!selectedTable) return;

    try {
      setDeleteLoading(true);
      const response = await authApis().delete(
        endpoints.deleteTable(dbId, selectedTable.name)
      );

      if (
        response.status === 200 ||
        response.status === 204 ||
        response.data?.code === 200
      ) {
        addToast("Xóa bảng thành công!", "success");
        setIsDeleteModalOpen(false);
        setSelectedTable(null);
        fetchTables();
      } else {
        addToast(response.data?.message || "Xóa bảng thất bại", "error");
      }
    } catch (error) {
      // Hiển thị lỗi chi tiết từ API
      let errorMsg = "Đã có lỗi xảy ra khi xóa bảng";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      addToast(errorMsg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fetch table data
  const fetchTableData = async (tableName, page = 0) => {
    setDataLoading(true);
    try {
      const response = await authApis().get(
        `${endpoints.getTableData(
          dbId,
          tableName
        )}?page=${page}&size=${dataPageSize}`
      );
      if (response.data.code === 200) {
        setTableData(response.data.data);
        setDataPage(page);
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch table structure
  const fetchTableStructure = async (tableName) => {
    setStructureLoading(true);
    try {
      const response = await authApis().get(
        endpoints.getTableStructure(dbId, tableName)
      );
      if (response.data.code === 200) {
        setTableStructure(response.data.data);
      } else {
        addToast(response.data.message, "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setStructureLoading(false);
    }
  };

  // Open view data modal
  const handleViewTableData = (table) => {
    setSelectedTable(table);
    setIsViewDataModalOpen(true);
    setSelectedRows([]);
    fetchTableData(table.name, 0);
    fetchTableStructure(table.name);
  };

  // Open structure modal
  const handleViewStructure = (table) => {
    setSelectedTable(table);
    setIsStructureModalOpen(true);
    setActiveStructureTab("view");
    setStructureChanges({ addColumns: [], dropColumns: [], modifyColumns: [] });
    setNewColumn({
      name: "",
      type: "varchar",
      length: "",
      constraints: "",
      defaultValue: "",
    });
    fetchTableStructure(table.name);
  };

  // Add column to changes
  const handleAddColumn = () => {
    if (!newColumn.name.trim()) {
      addToast("Vui lòng nhập tên cột", "error");
      return;
    }
    if (
      (newColumn.type === "varchar" || newColumn.type === "string") &&
      !newColumn.length
    ) {
      addToast("Varchar phải có độ dài", "error");
      return;
    }

    const columnData = {
      name: newColumn.name.trim(),
      type: newColumn.type,
      constraints: newColumn.constraints || undefined,
      defaultValue: newColumn.defaultValue || undefined,
    };

    if (newColumn.length) {
      columnData.length = parseInt(newColumn.length);
    }

    setStructureChanges({
      ...structureChanges,
      addColumns: [...structureChanges.addColumns, columnData],
    });

    setNewColumn({
      name: "",
      type: "varchar",
      length: "",
      constraints: "",
      defaultValue: "",
    });
    addToast("Đã thêm cột vào danh sách thay đổi", "success");
  };

  // Mark column for drop
  const handleMarkColumnForDrop = (columnName) => {
    if (structureChanges.dropColumns.includes(columnName)) {
      setStructureChanges({
        ...structureChanges,
        dropColumns: structureChanges.dropColumns.filter(
          (c) => c !== columnName
        ),
      });
    } else {
      setStructureChanges({
        ...structureChanges,
        dropColumns: [...structureChanges.dropColumns, columnName],
      });
    }
  };

  // Mark column for modify
  const handleMarkColumnForModify = (column, newData) => {
    const existingIndex = structureChanges.modifyColumns.findIndex(
      (c) => c.oldName === column.Field
    );

    const modifyData = {
      oldName: column.Field,
      newName: newData.newName || column.Field,
      type: newData.type || column.Type.split("(")[0],
      length: newData.length || undefined,
      constraints: newData.constraints || undefined,
      defaultValue:
        newData.defaultValue !== undefined ? newData.defaultValue : undefined,
    };

    if (existingIndex >= 0) {
      const updated = [...structureChanges.modifyColumns];
      updated[existingIndex] = modifyData;
      setStructureChanges({ ...structureChanges, modifyColumns: updated });
    } else {
      setStructureChanges({
        ...structureChanges,
        modifyColumns: [...structureChanges.modifyColumns, modifyData],
      });
    }
  };

  // Open add row modal
  const handleOpenAddRow = () => {
    setRowModalMode("add");
    setEditingRow(null);
    setRowFormError(""); // Clear any previous errors
    const initialData = {};
    tableStructure?.columns?.forEach((col) => {
      // Skip auto_increment fields and fields with default values
      const isAutoIncrement =
        col.Extra?.toLowerCase().includes("auto_increment");
      const hasDefaultValue = col.Default !== null && col.Default !== undefined;

      if (!isAutoIncrement) {
        // Initialize with empty string even if has default, user can choose to override
        initialData[col.Field] = "";
      }
    });
    setRowFormData(initialData);
    setIsRowModalOpen(true);
  };

  // Open edit row modal
  const handleOpenEditRow = (row) => {
    setRowModalMode("edit");
    setEditingRow(row);
    setRowFormError(""); // Clear any previous errors
    setRowFormData({ ...row });
    setIsRowModalOpen(true);
  };

  // Add rows
  const handleAddRows = async () => {
    try {
      setRowActionLoading(true);
      setRowFormError(""); // Clear previous errors

      // Filter out auto_increment fields and empty fields with default values
      const cleanedData = { ...rowFormData };
      tableStructure?.columns?.forEach((col) => {
        // Remove auto_increment fields
        if (col.Extra?.toLowerCase().includes("auto_increment")) {
          delete cleanedData[col.Field];
        }
        // Remove empty fields that have default values
        else if (
          col.Default !== null &&
          col.Default !== undefined &&
          (!cleanedData[col.Field] || cleanedData[col.Field].trim() === "")
        ) {
          delete cleanedData[col.Field];
        }
      });

      const payload = {
        data: [cleanedData],
      };

      console.log("Adding row with payload:", payload);
      const response = await authApis().post(
        endpoints.addTableRows(dbId, selectedTable.name),
        payload
      );

      console.log("Add row response:", response);
      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Thêm dòng thành công!", "success");
        setIsRowModalOpen(false);
        setRowFormError("");
        fetchTableData(selectedTable.name, dataPage);
      } else {
        console.error("Add row failed:", response.data);
        const errorMsg = response.data.message || "Thêm dòng thất bại";
        setRowFormError(errorMsg);
      }
    } catch (error) {
      console.error("Add row error:", error);

      // Hiển thị lỗi chi tiết từ API
      let errorMsg = "Đã có lỗi xảy ra khi thêm dòng";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        // Nếu có data nhưng không có message, hiển thị toàn bộ
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      setRowFormError(errorMsg);
    } finally {
      setRowActionLoading(false);
    }
  };

  // Update rows
  const handleUpdateRows = async () => {
    try {
      setRowActionLoading(true);
      setRowFormError(""); // Clear previous errors

      // Tìm primary key column
      const pkColumn = tableStructure?.columns?.find(
        (col) => col.Key === "PRI"
      );
      if (!pkColumn) {
        setRowFormError("Không tìm thấy primary key");
        setRowActionLoading(false);
        return;
      }

      const payload = {
        ids: [editingRow[pkColumn.Field]],
        data: [rowFormData],
      };

      console.log("Updating row with payload:", payload);
      const response = await authApis().patch(
        endpoints.updateTableRows(dbId, selectedTable.name),
        payload
      );

      console.log("Update row response:", response);
      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Cập nhật dòng thành công!", "success");
        setIsRowModalOpen(false);
        setRowFormError("");
        setSelectedRows([]);
        fetchTableData(selectedTable.name, dataPage);
      } else {
        console.error("Update row failed:", response.data);
        const errorMsg = response.data.message || "Cập nhật thất bại";
        setRowFormError(errorMsg);
      }
    } catch (error) {
      console.error("Update row error:", error);

      // Hiển thị lỗi chi tiết từ API
      let errorMsg = "Đã có lỗi xảy ra khi cập nhật dòng";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        // Nếu có data nhưng không có message, hiển thị toàn bộ
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      setRowFormError(errorMsg);
    } finally {
      setRowActionLoading(false);
    }
  };

  // Delete rows
  const handleDeleteRows = async () => {
    if (selectedRows.length === 0) {
      addToast("Vui lòng chọn ít nhất 1 dòng", "error");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedRows.length} dòng?`)) {
      return;
    }

    try {
      setRowActionLoading(true);

      console.log("Deleting rows with ids:", selectedRows);
      const response = await authApis().delete(
        endpoints.deleteTableRows(dbId, selectedTable.name),
        {
          data: { ids: selectedRows },
        }
      );

      console.log("Delete rows response:", response);
      if (
        response.status === 200 ||
        response.status === 204 ||
        response.data?.code === 200
      ) {
        addToast("Xóa dòng thành công!", "success");
        setSelectedRows([]);
        fetchTableData(selectedTable.name, dataPage);
      } else {
        console.error("Delete rows failed:", response.data);
        addToast(response.data?.message || "Xóa thất bại", "error");
      }
    } catch (error) {
      console.error("Delete rows error:", error);

      // Hiển thị lỗi chi tiết từ API
      let errorMsg = "Đã có lỗi xảy ra khi xóa dòng";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        // Nếu có data nhưng không có message, hiển thị toàn bộ
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      addToast(errorMsg, "error");
    } finally {
      setRowActionLoading(false);
    }
  };

  // Toggle row selection
  const toggleRowSelection = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  // Select all rows
  const toggleSelectAll = () => {
    const pkColumn = tableStructure?.columns?.find((col) => col.Key === "PRI");
    if (!pkColumn) return;

    if (selectedRows.length === tableData?.rows?.length) {
      setSelectedRows([]);
    } else {
      const allIds = tableData?.rows?.map((row) => row[pkColumn.Field]) || [];
      setSelectedRows(allIds);
    }
  };

  // Submit structure changes
  const handleUpdateStructure = async () => {
    if (
      structureChanges.addColumns.length === 0 &&
      structureChanges.dropColumns.length === 0 &&
      structureChanges.modifyColumns.length === 0
    ) {
      addToast("Không có thay đổi nào để áp dụng", "info");
      return;
    }

    try {
      setUpdateLoading(true);
      const payload = {};
      if (structureChanges.addColumns.length > 0)
        payload.addColumns = structureChanges.addColumns;
      if (structureChanges.dropColumns.length > 0)
        payload.dropColumns = structureChanges.dropColumns;
      if (structureChanges.modifyColumns.length > 0)
        payload.modifyColumns = structureChanges.modifyColumns;

      const response = await authApis().patch(
        endpoints.updateTableStructure(dbId, selectedTable.name),
        payload
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Cập nhật cấu trúc bảng thành công!", "success");
        setStructureChanges({
          addColumns: [],
          dropColumns: [],
          modifyColumns: [],
        });
        fetchTableStructure(selectedTable.name);
        setActiveStructureTab("view");
      } else {
        addToast(response.data.message || "Cập nhật thất bại", "error");
      }
    } catch (error) {
      // Hiển thị lỗi chi tiết từ API
      let errorMsg = "Đã có lỗi xảy ra khi cập nhật cấu trúc bảng";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      addToast(errorMsg, "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tableName: "",
      columns: [
        {
          name: "id",
          type: "serial",
          constraints: "Primary Key",
          foreignKeyTable: "",
          foreignKeyColumn: "",
          onDelete: "",
          onUpdate: "",
          length: "",
        },
      ],
    });
    setForeignKeyColumnsMap({}); // Reset foreign key columns cache
  };

  // Handle import SQL file
  const handleImportFile = async () => {
    if (!selectedFile) {
      addToast("Vui lòng chọn file SQL", "error");
      return;
    }

    try {
      setImportLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await authApis().post(
        endpoints.importSqlFile(dbId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Import file SQL thành công!", "success");
        setIsImportModalOpen(false);
        setSelectedFile(null);
        fetchTables();
      } else {
        addToast(response.data.message || "Import file thất bại", "error");
      }
    } catch (error) {
      console.error("Import error:", error);
      let errorMsg = "Đã có lỗi xảy ra khi import file";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data) {
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = `Lỗi: ${error.message}`;
      }

      addToast(errorMsg, "error");
    } finally {
      setImportLoading(false);
    }
  };

  useEffect(() => {
    if (dbId) {
      fetchTables();
    }
  }, [dbId]);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Bảng dữ liệu</h3>
          <p className="text-slate-400 text-sm mt-1">
            Quản lý các bảng trong database {databaseName}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchTables}
            className="flex items-center gap-2 w-fit cursor-pointer bg-slate-700 hover:bg-slate-600"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Làm mới
          </Button>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 w-fit cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            <Upload size={18} />
            Import File
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 w-fit cursor-pointer"
          >
            <Plus size={18} />
            Tạo Bảng Mới
          </Button>
        </div>
      </div>

      {/* Import SQL File Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setSelectedFile(null);
        }}
        title="Import File SQL"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chọn file SQL <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
              <input
                type="file"
                accept=".sql"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
                id="sql-file-input"
                disabled={importLoading}
              />
              <label
                htmlFor="sql-file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={48} className="text-slate-500 mb-3" />
                <p className="text-slate-300 font-medium mb-1">
                  {selectedFile ? selectedFile.name : "Chọn file SQL"}
                </p>
                <p className="text-slate-500 text-sm">
                  Hỗ trợ file .sql (tối đa 50MB)
                </p>
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-1">
              <p className="text-sm text-slate-300">
                <span className="text-slate-400">Tên file:</span>{" "}
                <span className="font-medium">{selectedFile.name}</span>
              </p>
              <p className="text-sm text-slate-300">
                <span className="text-slate-400">Kích thước:</span>{" "}
                <span className="font-medium">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </span>
              </p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              ℹ️ File SQL sẽ được thực thi để tạo bảng và dữ liệu trong database
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              onClick={() => {
                setIsImportModalOpen(false);
                setSelectedFile(null);
              }}
              disabled={importLoading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={handleImportFile}
              disabled={!selectedFile || importLoading}
              className="flex-1 cursor-pointer flex items-center justify-center gap-2"
            >
              {importLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Table Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Tạo Bảng Mới"
        size="large"
      >
        <form onSubmit={handleCreateTable} className="space-y-4">
          {/* Table Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tên Bảng <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Nhập tên bảng (vd: users, posts)..."
              value={formData.tableName}
              onChange={(e) =>
                setFormData({ ...formData, tableName: e.target.value })
              }
              disabled={createLoading}
              required
            />
          </div>

          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Các Cột <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                onClick={addColumn}
                disabled={createLoading}
                className="flex items-center gap-1 text-xs cursor-pointer w-fit"
              >
                <Plus size={14} />
                Thêm cột
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.columns.map((column, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      Cột {index + 1}
                    </span>
                    {formData.columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        disabled={createLoading}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Column Name */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Tên cột
                      </label>
                      <Input
                        className="px-3 py-3"
                        type="text"
                        placeholder="vd: user_id"
                        value={column.name}
                        onChange={(e) =>
                          updateColumn(index, "name", e.target.value)
                        }
                        disabled={createLoading}
                        required
                      />
                    </div>

                    {/* Column Type */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Kiểu dữ liệu
                      </label>
                      <select
                        value={column.type}
                        onChange={(e) =>
                          updateColumn(index, "type", e.target.value)
                        }
                        disabled={createLoading}
                        className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        {columnTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Length (for varchar) */}
                    {column.type === "varchar" && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Độ dài
                        </label>
                        <Input
                          type="number"
                          placeholder="200"
                          value={column.length}
                          onChange={(e) =>
                            updateColumn(index, "length", e.target.value)
                          }
                          disabled={createLoading}
                        />
                      </div>
                    )}

                    {/* Constraints */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Ràng buộc
                      </label>
                      <select
                        value={column.constraints}
                        onChange={(e) =>
                          updateColumn(index, "constraints", e.target.value)
                        }
                        disabled={createLoading}
                        className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">-- Không có --</option>
                        {constraintOptions
                          .filter((c) => c)
                          .map((constraint) => (
                            <option key={constraint} value={constraint}>
                              {constraint}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Foreign Key Table */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Bảng tham chiếu
                      </label>
                      <select
                        value={column.foreignKeyTable}
                        onChange={(e) =>
                          updateColumn(index, "foreignKeyTable", e.target.value)
                        }
                        disabled={createLoading}
                        className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- Chọn bảng --</option>
                        {tables.map((table) => (
                          <option key={table.name} value={table.name}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Foreign Key Column */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Cột tham chiếu
                      </label>
                      <select
                        value={column.foreignKeyColumn}
                        onChange={(e) =>
                          updateColumn(
                            index,
                            "foreignKeyColumn",
                            e.target.value
                          )
                        }
                        disabled={
                          createLoading ||
                          !column.foreignKeyTable ||
                          !foreignKeyColumnsMap[column.foreignKeyTable]
                        }
                        className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">-- Chọn cột --</option>
                        {column.foreignKeyTable &&
                          foreignKeyColumnsMap[column.foreignKeyTable]?.map(
                            (col) => (
                              <option key={col.name} value={col.name}>
                                {col.name} ({col.type})
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    {/* On Delete */}
                    {column.foreignKeyTable && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          On Delete
                        </label>
                        <select
                          value={column.onDelete}
                          onChange={(e) =>
                            updateColumn(index, "onDelete", e.target.value)
                          }
                          disabled={createLoading}
                          className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">-- Chọn --</option>
                          {cascadeOptions
                            .filter((c) => c)
                            .map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* On Update */}
                    {column.foreignKeyTable && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          On Update
                        </label>
                        <select
                          value={column.onUpdate}
                          onChange={(e) =>
                            updateColumn(index, "onUpdate", e.target.value)
                          }
                          disabled={createLoading}
                          className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">-- Chọn --</option>
                          {cascadeOptions
                            .filter((c) => c)
                            .map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={createLoading}
              className="flex-1 bg-slate-800 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createLoading} className="flex-1">
              {createLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Đang tạo...
                </span>
              ) : (
                "Tạo Bảng"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Table Structure Modal */}
      <TableStructureModal
        isOpen={isStructureModalOpen}
        onClose={() => {
          setIsStructureModalOpen(false);
          setSelectedTable(null);
          setTableStructure(null);
          setStructureChanges({
            addColumns: [],
            dropColumns: [],
            modifyColumns: [],
          });
        }}
        tableName={selectedTable?.name}
        structure={tableStructure}
        loading={structureLoading}
        updateLoading={updateLoading}
        activeTab={activeStructureTab}
        setActiveTab={setActiveStructureTab}
        structureChanges={structureChanges}
        newColumn={newColumn}
        setNewColumn={setNewColumn}
        onAddColumn={handleAddColumn}
        onMarkForDrop={handleMarkColumnForDrop}
        onMarkForModify={handleMarkColumnForModify}
        onUpdate={handleUpdateStructure}
        columnTypes={columnTypes}
        constraintOptions={constraintOptions}
      />

      {/* Row Add/Edit Modal - Custom with higher z-index */}
      {isRowModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsRowModalOpen(false);
              setEditingRow(null);
              setRowFormData({});
              setRowFormError("");
            }}
          ></div>

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl my-4 sm:my-8 max-h-[95vh] sm:max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-800 bg-slate-900 flex-shrink-0">
              <h2 className="text-base md:text-lg font-bold text-white">
                {rowModalMode === "add" ? "Thêm dòng mới" : "Sửa dòng"}
              </h2>
              <button
                onClick={() => {
                  setIsRowModalOpen(false);
                  setEditingRow(null);
                  setRowFormData({});
                  setRowFormError("");
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {rowFormError && (
              <div className="mx-4 md:mx-6 mt-3 md:mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400 break-words">
                  {rowFormError}
                </p>
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1 px-4 md:px-6 py-3 md:py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                {tableStructure?.columns
                  ?.filter((col) => {
                    // Hide auto_increment fields in add mode
                    if (
                      rowModalMode === "add" &&
                      col.Extra?.toLowerCase().includes("auto_increment")
                    ) {
                      return false;
                    }
                    return true;
                  })
                  ?.map((col) => {
                    const isAutoIncrement =
                      col.Extra?.toLowerCase().includes("auto_increment");
                    const hasDefaultValue =
                      col.Default !== null && col.Default !== undefined;
                    const isRequired =
                      col.Null === "NO" && !isAutoIncrement && !hasDefaultValue;

                    return (
                      <div key={col.Field}>
                        <label className="block text-xs text-slate-400 mb-1">
                          {col.Field}
                          {isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                          {isAutoIncrement && (
                            <span className="text-emerald-500 ml-1 text-xs">
                              (auto)
                            </span>
                          )}
                          {!isAutoIncrement &&
                            hasDefaultValue &&
                            rowModalMode === "add" && (
                              <span className="text-blue-400 ml-1 text-xs">
                                (default: {col.Default})
                              </span>
                            )}
                        </label>
                        <Input
                          type="text"
                          placeholder={`${col.Type}`}
                          value={rowFormData[col.Field] || ""}
                          onChange={(e) =>
                            setRowFormData({
                              ...rowFormData,
                              [col.Field]: e.target.value,
                            })
                          }
                          disabled={
                            rowActionLoading ||
                            isAutoIncrement ||
                            (rowModalMode === "edit" && col.Key === "PRI")
                          }
                        />
                        <p className="text-xs text-slate-500 mt-0.5">
                          {col.Type} {col.Extra && `(${col.Extra})`}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex gap-2 md:gap-3 px-4 md:px-6 py-3 border-t border-slate-700 bg-slate-900 flex-shrink-0">
              <Button
                onClick={() => {
                  setIsRowModalOpen(false);
                  setEditingRow(null);
                  setRowFormData({});
                }}
                disabled={rowActionLoading}
                className="flex-1 bg-slate-800 hover:bg-slate-700"
              >
                Hủy
              </Button>
              <Button
                onClick={
                  rowModalMode === "add" ? handleAddRows : handleUpdateRows
                }
                disabled={rowActionLoading}
                className="flex-1 cursor-pointer flex items-center justify-center gap-2"
              >
                {rowActionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Đang lưu...</span>
                  </span>
                ) : (
                  <>
                    <Save size={16} />
                    <span className="text-sm">
                      {rowModalMode === "add" ? "Thêm" : "Cập nhật"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Table Data Modal */}
      <Modal
        isOpen={isViewDataModalOpen}
        onClose={() => {
          setIsViewDataModalOpen(false);
          setSelectedTable(null);
          setTableData(null);
          setTableStructure(null);
          setDataPage(0);
          setSelectedRows([]);
        }}
        title={`Dữ liệu bảng: ${selectedTable?.name || ""}`}
        size="xl"
      >
        <div className="space-y-4">
          {dataLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="animate-spin" size={20} />
                <span>Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : tableData ? (
            <>
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={handleOpenAddRow}
                    disabled={rowActionLoading}
                    className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Thêm dòng</span>
                    <span className="sm:hidden">Thêm</span>
                  </Button>
                  {selectedRows.length > 0 && (
                    <Button
                      onClick={handleDeleteRows}
                      disabled={rowActionLoading}
                      className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer bg-red-600 hover:bg-red-700"
                    >
                      <Trash size={16} />
                      Xóa ({selectedRows.length})
                    </Button>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-slate-400">
                  Tổng:{" "}
                  <span className="text-white font-medium">
                    {tableData.totalRows}
                  </span>{" "}
                  dòng
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto max-h-[60vh] sm:max-h-96 border border-slate-700 rounded-lg">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-800 sticky top-0">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left border-b border-slate-700">
                        <input
                          type="checkbox"
                          checked={
                            tableData.rows &&
                            tableData.rows.length > 0 &&
                            selectedRows.length === tableData.rows.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      {tableData.columns?.map((col) => (
                        <th
                          key={col}
                          className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows && tableData.rows.length > 0 ? (
                      tableData.rows.map((row, idx) => {
                        const pkColumn = tableStructure?.columns?.find(
                          (col) => col.Key === "PRI"
                        );
                        const rowId = pkColumn ? row[pkColumn.Field] : idx;
                        const isSelected = selectedRows.includes(rowId);

                        return (
                          <tr
                            key={idx}
                            className={`border-b border-slate-700 hover:bg-slate-800/30 ${
                              isSelected ? "bg-emerald-500/5" : ""
                            }`}
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRowSelection(rowId)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            {tableData.columns?.map((col) => (
                              <td
                                key={col}
                                className="px-2 sm:px-4 py-2 sm:py-3 text-slate-300"
                              >
                                {row[col] !== null && row[col] !== undefined ? (
                                  <span className="break-all">
                                    {String(row[col])}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic">
                                    null
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <button
                                onClick={() => handleOpenEditRow(row)}
                                disabled={rowActionLoading}
                                className="text-blue-400 hover:text-blue-300 disabled:opacity-50 p-1"
                                title="Sửa"
                              >
                                <Edit size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={(tableData.columns?.length || 0) + 2}
                          className="px-2 sm:px-4 py-6 sm:py-8 text-center text-slate-400 text-xs sm:text-sm"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {tableData.totalRows > dataPageSize && (
                <div className="flex items-center justify-between pt-2 gap-2">
                  <Button
                    onClick={() =>
                      fetchTableData(selectedTable.name, dataPage - 1)
                    }
                    disabled={dataPage === 0 || dataLoading}
                    className="flex items-center gap-1 text-xs sm:text-sm cursor-pointer px-2 sm:px-4"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Trước</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-slate-400 text-center">
                    <span className="hidden sm:inline">Trang </span>
                    {dataPage + 1} /{" "}
                    {Math.ceil(tableData.totalRows / dataPageSize)}
                  </span>
                  <Button
                    onClick={() =>
                      fetchTableData(selectedTable.name, dataPage + 1)
                    }
                    disabled={
                      dataPage >=
                        Math.ceil(tableData.totalRows / dataPageSize) - 1 ||
                      dataLoading
                    }
                    className="flex items-center gap-1 text-xs sm:text-sm cursor-pointer px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Không thể tải dữ liệu
            </div>
          )}
        </div>
      </Modal>

      {/* Row Add/Edit Modal - MOVED OUTSIDE to avoid z-index issue */}
      {isRowModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsRowModalOpen(false);
              setEditingRow(null);
              setRowFormData({});
              setRowFormError("");
            }}
          ></div>

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {rowModalMode === "add" ? "Thêm dòng mới" : "Sửa dòng"}
              </h2>
              <button
                onClick={() => {
                  setIsRowModalOpen(false);
                  setEditingRow(null);
                  setRowFormData({});
                  setRowFormError("");
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {rowFormError && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400 break-words">
                  {rowFormError}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {tableStructure?.columns
                  ?.filter((col) => {
                    // Hide auto_increment fields in add mode
                    if (
                      rowModalMode === "add" &&
                      col.Extra?.toLowerCase().includes("auto_increment")
                    ) {
                      return false;
                    }
                    return true;
                  })
                  ?.map((col) => {
                    const isAutoIncrement =
                      col.Extra?.toLowerCase().includes("auto_increment");
                    const hasDefaultValue =
                      col.Default !== null && col.Default !== undefined;
                    const isRequired =
                      col.Null === "NO" && !isAutoIncrement && !hasDefaultValue;

                    return (
                      <div key={col.Field}>
                        <label className="block text-xs text-slate-400 mb-1">
                          {col.Field}
                          {isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                          {isAutoIncrement && (
                            <span className="text-emerald-500 ml-1 text-xs">
                              (auto)
                            </span>
                          )}
                          {!isAutoIncrement &&
                            hasDefaultValue &&
                            rowModalMode === "add" && (
                              <span className="text-blue-400 ml-1 text-xs">
                                (default: {col.Default})
                              </span>
                            )}
                        </label>
                        <Input
                          type="text"
                          placeholder={`${col.Type}`}
                          value={rowFormData[col.Field] || ""}
                          onChange={(e) =>
                            setRowFormData({
                              ...rowFormData,
                              [col.Field]: e.target.value,
                            })
                          }
                          disabled={
                            rowActionLoading ||
                            isAutoIncrement ||
                            (rowModalMode === "edit" && col.Key === "PRI")
                          }
                        />
                        <p className="text-xs text-slate-500 mt-0.5">
                          {col.Type} {col.Extra && `(${col.Extra})`}
                        </p>
                      </div>
                    );
                  })}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  onClick={() => {
                    setIsRowModalOpen(false);
                    setEditingRow(null);
                    setRowFormData({});
                  }}
                  disabled={rowActionLoading}
                  className="flex-1 bg-slate-800 hover:bg-slate-700"
                >
                  Hủy
                </Button>
                <Button
                  onClick={
                    rowModalMode === "add" ? handleAddRows : handleUpdateRows
                  }
                  disabled={rowActionLoading}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2"
                >
                  {rowActionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </span>
                  ) : (
                    <>
                      <Save size={16} />
                      {rowModalMode === "add" ? "Thêm" : "Cập nhật"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTable(null);
        }}
        onConfirm={handleDeleteTable}
        title="Xác nhận xóa bảng"
        message={`Bạn có chắc chắn muốn xóa bảng "${selectedTable?.name}"? Tất cả dữ liệu trong bảng sẽ bị mất vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmText="Xóa bảng"
        cancelText="Hủy"
        loading={deleteLoading}
        variant="danger"
      />

      {/* Tables Grid */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span>Đang tải...</span>
            </div>
          </div>
        ) : tables.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.name}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <TableIcon size={20} className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">
                        {table.name}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {table.totalColumns || 0} cột
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewTableData(table)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                      title="Xem dữ liệu"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleViewStructure(table)}
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                      title="Cấu trúc bảng"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTable(table);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa bảng"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-4">
              <Database size={32} className="text-slate-600" />
            </div>
            <p className="text-slate-400 mb-2">
              Chưa có bảng nào trong database
            </p>
            <p className="text-slate-500 text-sm">
              Tạo bảng mới để bắt đầu lưu trữ dữ liệu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
