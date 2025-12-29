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
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
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
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
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
    const initialData = {};
    tableStructure?.columns?.forEach((col) => {
      initialData[col.Field] = "";
    });
    setRowFormData(initialData);
    setIsRowModalOpen(true);
  };

  // Open edit row modal
  const handleOpenEditRow = (row) => {
    setRowModalMode("edit");
    setEditingRow(row);
    setRowFormData({ ...row });
    setIsRowModalOpen(true);
  };

  // Add rows
  const handleAddRows = async () => {
    try {
      setRowActionLoading(true);
      const payload = {
        data: [rowFormData],
      };

      const response = await authApis().post(
        endpoints.addTableRows(dbId, selectedTable.name),
        payload
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Thêm dòng thành công!", "success");
        setIsRowModalOpen(false);
        fetchTableData(selectedTable.name, dataPage);
      } else {
        addToast(response.data.message || "Thêm dòng thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
    } finally {
      setRowActionLoading(false);
    }
  };

  // Update rows
  const handleUpdateRows = async () => {
    try {
      setRowActionLoading(true);

      // Tìm primary key column
      const pkColumn = tableStructure?.columns?.find(
        (col) => col.Key === "PRI"
      );
      if (!pkColumn) {
        addToast("Không tìm thấy primary key", "error");
        return;
      }

      const payload = {
        ids: [editingRow[pkColumn.Field]],
        data: [rowFormData],
      };

      const response = await authApis().patch(
        endpoints.updateTableRows(dbId, selectedTable.name),
        payload
      );

      if (response.data.code === 200 || response.data.code === 201) {
        addToast("Cập nhật dòng thành công!", "success");
        setIsRowModalOpen(false);
        setSelectedRows([]);
        fetchTableData(selectedTable.name, dataPage);
      } else {
        addToast(response.data.message || "Cập nhật thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
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

      const response = await authApis().delete(
        endpoints.deleteTableRows(dbId, selectedTable.name),
        {
          data: { ids: selectedRows },
        }
      );

      if (
        response.status === 200 ||
        response.status === 204 ||
        response.data?.code === 200
      ) {
        addToast("Xóa dòng thành công!", "success");
        setSelectedRows([]);
        fetchTableData(selectedTable.name, dataPage);
      } else {
        addToast(response.data?.message || "Xóa thất bại", "error");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
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
      addToast(error.response?.data?.message || "Đã có lỗi xảy ra", "error");
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 w-fit cursor-pointer"
          >
            <Plus size={18} />
            Tạo Bảng Mới
          </Button>
        </div>
      </div>

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
                      <Input
                        className="px-3 py-3"
                        type="text"
                        placeholder="vd: users"
                        value={column.foreignKeyTable}
                        onChange={(e) =>
                          updateColumn(index, "foreignKeyTable", e.target.value)
                        }
                        disabled={createLoading}
                      />
                    </div>

                    {/* Foreign Key Column */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Cột tham chiếu
                      </label>
                      <Input
                        className="px-3 py-3"
                        type="text"
                        placeholder="vd: id"
                        value={column.foreignKeyColumn}
                        onChange={(e) =>
                          updateColumn(
                            index,
                            "foreignKeyColumn",
                            e.target.value
                          )
                        }
                        disabled={createLoading}
                      />
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
      />

      {/* Row Add/Edit Modal - Custom with higher z-index */}
      {isRowModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsRowModalOpen(false);
              setEditingRow(null);
              setRowFormData({});
            }}
          ></div>

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-white">
                {rowModalMode === "add" ? "Thêm dòng mới" : "Sửa dòng"}
              </h2>
              <button
                onClick={() => {
                  setIsRowModalOpen(false);
                  setEditingRow(null);
                  setRowFormData({});
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {tableStructure?.columns?.map((col) => (
                    <div key={col.Field}>
                      <label className="block text-xs text-slate-400 mb-1">
                        {col.Field}
                        {col.Null === "NO" && (
                          <span className="text-red-500 ml-1">*</span>
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
                          (rowModalMode === "edit" && col.Key === "PRI")
                        }
                      />
                      <p className="text-xs text-slate-500 mt-0.5">
                        {col.Type} {col.Extra && `(${col.Extra})`}
                      </p>
                    </div>
                  ))}
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
                    className="flex-1 cursor-pointer"
                  >
                    {rowActionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Đang lưu...
                      </span>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {rowModalMode === "add" ? "Thêm" : "Cập nhật"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleOpenAddRow}
                    disabled={rowActionLoading}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Plus size={16} />
                    Thêm dòng
                  </Button>
                  {selectedRows.length > 0 && (
                    <Button
                      onClick={handleDeleteRows}
                      disabled={rowActionLoading}
                      className="flex items-center gap-2 text-sm cursor-pointer bg-red-600 hover:bg-red-700"
                    >
                      <Trash size={16} />
                      Xóa ({selectedRows.length})
                    </Button>
                  )}
                </div>
                <span className="text-sm text-slate-400">
                  Tổng số:{" "}
                  <span className="text-white font-medium">
                    {tableData.totalRows}
                  </span>{" "}
                  dòng
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto max-h-96 border border-slate-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-slate-700">
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
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700"
                        >
                          {col}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">
                        Hành động
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
                            <td className="px-4 py-3">
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
                                className="px-4 py-3 text-slate-300"
                              >
                                {row[col] !== null && row[col] !== undefined ? (
                                  String(row[col])
                                ) : (
                                  <span className="text-slate-500 italic">
                                    null
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleOpenEditRow(row)}
                                disabled={rowActionLoading}
                                className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                title="Sửa"
                              >
                                <Edit size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={(tableData.columns?.length || 0) + 2}
                          className="px-4 py-8 text-center text-slate-400"
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
                <div className="flex items-center justify-between pt-2">
                  <Button
                    onClick={() =>
                      fetchTableData(selectedTable.name, dataPage - 1)
                    }
                    disabled={dataPage === 0 || dataLoading}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    Trước
                  </Button>
                  <span className="text-sm text-slate-400">
                    Trang {dataPage + 1} /{" "}
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
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    Sau
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
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {tableStructure?.columns?.map((col) => (
                  <div key={col.Field}>
                    <label className="block text-xs text-slate-400 mb-1">
                      {col.Field}
                      {col.Null === "NO" && (
                        <span className="text-red-500 ml-1">*</span>
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
                        (rowModalMode === "edit" && col.Key === "PRI")
                      }
                    />
                    <p className="text-xs text-slate-500 mt-0.5">
                      {col.Type} {col.Extra && `(${col.Extra})`}
                    </p>
                  </div>
                ))}
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
                  className="flex-1 cursor-pointer"
                >
                  {rowActionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </span>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
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
