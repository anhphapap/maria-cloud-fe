import {
  Loader2,
  Plus,
  Trash,
  Code,
  Settings,
  Eye,
  X,
  Table,
  Key,
  Edit,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useState } from "react";

export default function TableStructureModal({
  isOpen,
  onClose,
  tableName,
  structure,
  loading,
  updateLoading,
  activeTab,
  setActiveTab,
  structureChanges,
  newColumn,
  setNewColumn,
  onAddColumn,
  onMarkForDrop,
  onMarkForModify,
  onUpdate,
  columnTypes,
  constraintOptions,
}) {
  const [viewSubTab, setViewSubTab] = useState("columns");
  const [editingColumn, setEditingColumn] = useState(null);
  const [modifyForm, setModifyForm] = useState({
    oldName: "",
    newName: "",
    type: "",
    length: "",
    constraints: "",
    defaultValue: "",
  });

  // Handler for opening edit form for a column
  const handleEditColumn = (col) => {
    // Parse type and length from col.Type (e.g., "varchar(500)", "int(11)")
    const typeMatch = col.Type.match(/^(\w+)(?:\((\d+)\))?/);
    const type = typeMatch ? typeMatch[1] : col.Type;
    const length = typeMatch && typeMatch[2] ? typeMatch[2] : "";

    setEditingColumn(col.Field);
    setModifyForm({
      oldName: col.Field,
      newName: col.Field,
      type: type,
      length: length,
      constraints: col.Null === "NO" ? "NOT NULL" : "",
      defaultValue: col.Default || "",
    });
  };

  // Handler for saving modify column
  const handleSaveModifyColumn = () => {
    if (!modifyForm.newName || !modifyForm.type) return;

    // Find the original column
    const originalColumn = structure.columns.find(
      (col) => col.Field === modifyForm.oldName
    );
    if (!originalColumn) return;

    onMarkForModify(originalColumn, {
      newName: modifyForm.newName,
      type: modifyForm.type,
      length: modifyForm.length || undefined,
      constraints: modifyForm.constraints || undefined,
      defaultValue: modifyForm.defaultValue || undefined,
    });

    setEditingColumn(null);
    setModifyForm({
      oldName: "",
      newName: "",
      type: "",
      length: "",
      constraints: "",
      defaultValue: "",
    });
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingColumn(null);
    setModifyForm({
      oldName: "",
      newName: "",
      type: "",
      length: "",
      constraints: "",
      defaultValue: "",
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "view", name: "Xem cấu trúc", icon: Eye },
    { id: "add", name: "Thêm cột", icon: Plus },
    { id: "modify", name: "Sửa/Xóa", icon: Settings },
  ];

  const viewTabs = [
    { id: "columns", name: "Cột", icon: Table },
    { id: "indexes", name: "Index", icon: Key },
    { id: "create", name: "CREATE", icon: Code },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cấu trúc bảng: ${tableName || ""}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 text-sm font-medium transition-colors relative cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-emerald-500"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span>Đang tải cấu trúc...</span>
            </div>
          </div>
        ) : structure ? (
          <>
            {/* View Structure Tab */}
            {activeTab === "view" && (
              <div className="space-y-3">
                {/* Sub Tabs */}
                <div className="flex gap-2 border-b border-slate-700 pb-2">
                  {viewTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setViewSubTab(tab.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                          viewSubTab === tab.id
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={14} />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {/* Columns Tab */}
                {viewSubTab === "columns" && (
                  <div className="overflow-x-auto border border-slate-700 rounded-lg max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                            Tên
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                            Kiểu
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                            Null
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                            Key
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                            Default
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                            Extra
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {structure.columns?.map((col, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-700 hover:bg-slate-800/30"
                          >
                            <td className="px-3 py-2 text-white font-medium">
                              {col.Field}
                            </td>
                            <td className="px-3 py-2 text-emerald-400 text-xs">
                              {col.Type}
                            </td>
                            <td className="px-3 py-2 text-slate-300 text-xs">
                              {col.Null}
                            </td>
                            <td className="px-3 py-2">
                              {col.Key && (
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded">
                                  {col.Key}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-300 text-xs">
                              {col.Default || (
                                <span className="text-slate-500 italic">
                                  null
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-400 text-xs">
                              {col.Extra}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Indexes Tab */}
                {viewSubTab === "indexes" && (
                  <div>
                    {structure.indexes && structure.indexes.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-700 rounded-lg max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-800 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                                Key Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                                Column
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                                Unique
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase">
                                Type
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {structure.indexes.map((idx, i) => (
                              <tr
                                key={i}
                                className="border-b border-slate-700 hover:bg-slate-800/30"
                              >
                                <td className="px-3 py-2 text-white">
                                  {idx.Key_name}
                                </td>
                                <td className="px-3 py-2 text-emerald-400">
                                  {idx.Column_name}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded ${
                                      idx.Non_unique === 0
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-slate-700 text-slate-400"
                                    }`}
                                  >
                                    {idx.Non_unique === 0 ? "Yes" : "No"}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-slate-300 text-xs">
                                  {idx.Index_type}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        Không có index nào
                      </div>
                    )}
                  </div>
                )}

                {/* Create Statement Tab */}
                {viewSubTab === "create" && (
                  <div>
                    {structure.createStatement ? (
                      <pre className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto max-h-[400px] overflow-y-auto">
                        {structure.createStatement}
                      </pre>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        Không có CREATE statement
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add Column Tab */}
            {activeTab === "add" && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4">
                    Thêm cột mới
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Tên cột *
                      </label>
                      <Input
                        type="text"
                        placeholder="vd: age"
                        value={newColumn.name}
                        onChange={(e) =>
                          setNewColumn({ ...newColumn, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Kiểu dữ liệu *
                      </label>
                      <select
                        value={newColumn.type}
                        onChange={(e) =>
                          setNewColumn({ ...newColumn, type: e.target.value })
                        }
                        className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {columnTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(newColumn.type === "varchar" ||
                      newColumn.type === "string") && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Độ dài
                        </label>
                        <Input
                          type="number"
                          placeholder="255"
                          value={newColumn.length}
                          onChange={(e) =>
                            setNewColumn({
                              ...newColumn,
                              length: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Ràng buộc
                      </label>
                      <Input
                        type="text"
                        placeholder="vd: NOT NULL"
                        value={newColumn.constraints}
                        onChange={(e) =>
                          setNewColumn({
                            ...newColumn,
                            constraints: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        Giá trị mặc định
                      </label>
                      <Input
                        type="text"
                        placeholder="vd: 18 hoặc CURRENT_TIMESTAMP"
                        value={newColumn.defaultValue}
                        onChange={(e) =>
                          setNewColumn({
                            ...newColumn,
                            defaultValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={onAddColumn}
                    className="mt-4 w-full cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Thêm vào danh sách
                  </Button>
                </div>

                {/* Preview added columns */}
                {structureChanges.addColumns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Các cột sẽ được thêm ({structureChanges.addColumns.length}
                      ):
                    </h4>
                    <div className="space-y-2">
                      {structureChanges.addColumns.map((col, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="text-sm">
                            <span className="text-white font-medium">
                              {col.name}
                            </span>
                            <span className="text-emerald-400 ml-2">
                              {col.type}
                              {col.length && `(${col.length})`}
                            </span>
                            {col.constraints && (
                              <span className="text-slate-400 ml-2">
                                {col.constraints}
                              </span>
                            )}
                            {col.defaultValue && (
                              <span className="text-slate-400 ml-2">
                                default: {col.defaultValue}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const newList =
                                structureChanges.addColumns.filter(
                                  (_, i) => i !== idx
                                );
                              onAddColumn({ addColumns: newList });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modify/Drop Tab */}
            {activeTab === "modify" && (
              <div className="space-y-4">
                <div className="text-sm text-slate-400 mb-4">
                  Click nút <span className="text-blue-400">sửa</span> để chỉnh
                  sửa cột, hoặc nút <span className="text-red-400">xóa</span> để
                  đánh dấu xóa cột.
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {structure.columns?.map((col, idx) => {
                    const markedForDrop = structureChanges.dropColumns.includes(
                      col.Field
                    );
                    const isEditing = editingColumn === col.Field;
                    const markedForModify = structureChanges.modifyColumns.find(
                      (m) => m.oldName === col.Field
                    );

                    return (
                      <div
                        key={idx}
                        className={`border rounded-lg p-3 transition-colors ${
                          markedForDrop
                            ? "bg-red-500/10 border-red-500/50"
                            : markedForModify
                            ? "bg-blue-500/10 border-blue-500/50"
                            : isEditing
                            ? "bg-emerald-500/10 border-emerald-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        {!isEditing ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-medium ${
                                  markedForDrop
                                    ? "text-red-400 line-through"
                                    : markedForModify
                                    ? "text-blue-400"
                                    : "text-white"
                                }`}
                              >
                                {markedForModify
                                  ? `${col.Field} → ${markedForModify.newName}`
                                  : col.Field}
                              </span>
                              <span
                                className={`text-sm ${
                                  markedForModify
                                    ? "text-blue-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {markedForModify
                                  ? `${col.Type} → ${markedForModify.type}${
                                      markedForModify.length
                                        ? `(${markedForModify.length})`
                                        : ""
                                    }`
                                  : col.Type}
                              </span>
                              {col.Key && (
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded">
                                  {col.Key}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditColumn(col)}
                                disabled={markedForDrop}
                                className={`p-2 rounded-lg transition-colors ${
                                  markedForDrop
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-blue-500/20 text-blue-400"
                                }`}
                                title="Sửa cột"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => onMarkForDrop(col.Field)}
                                className={`p-2 rounded-lg transition-colors ${
                                  markedForDrop
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "hover:bg-slate-700 text-slate-400"
                                }`}
                                title={
                                  markedForDrop
                                    ? "Bỏ đánh dấu xóa"
                                    : "Đánh dấu để xóa"
                                }
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                  Tên cột
                                </label>
                                <Input
                                  value={modifyForm.newName}
                                  onChange={(e) =>
                                    setModifyForm({
                                      ...modifyForm,
                                      newName: e.target.value,
                                    })
                                  }
                                  placeholder="Tên cột"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                  Kiểu dữ liệu
                                </label>
                                <select
                                  value={modifyForm.type}
                                  onChange={(e) =>
                                    setModifyForm({
                                      ...modifyForm,
                                      type: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  {columnTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {["varchar", "char", "int", "bigint"].includes(
                                modifyForm.type
                              ) && (
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">
                                    Độ dài
                                  </label>
                                  <Input
                                    value={modifyForm.length}
                                    onChange={(e) =>
                                      setModifyForm({
                                        ...modifyForm,
                                        length: e.target.value,
                                      })
                                    }
                                    placeholder="Độ dài"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                  Ràng buộc
                                </label>
                                <select
                                  value={modifyForm.constraints}
                                  onChange={(e) =>
                                    setModifyForm({
                                      ...modifyForm,
                                      constraints: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-3.25 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  <option value="">Không có</option>
                                  {constraintOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-slate-400 mb-1">
                                Giá trị mặc định
                              </label>
                              <Input
                                value={modifyForm.defaultValue}
                                onChange={(e) =>
                                  setModifyForm({
                                    ...modifyForm,
                                    defaultValue: e.target.value,
                                  })
                                }
                                placeholder="Giá trị mặc định (để trống nếu NULL)"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveModifyColumn}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                Lưu thay đổi
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-slate-700 hover:bg-slate-600"
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {structureChanges.dropColumns.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-400">
                      ⚠️ Sẽ xóa {structureChanges.dropColumns.length} cột:{" "}
                      {structureChanges.dropColumns.join(", ")}
                    </p>
                  </div>
                )}

                {structureChanges.modifyColumns.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-400">
                      ℹ️ Sẽ sửa {structureChanges.modifyColumns.length} cột:{" "}
                      {structureChanges.modifyColumns
                        .map((m) => `${m.oldName} → ${m.newName}`)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={onClose}
                disabled={updateLoading}
                className="flex-1 bg-slate-800 hover:bg-slate-700"
              >
                Đóng
              </Button>
              {activeTab !== "view" && (
                <Button
                  onClick={onUpdate}
                  disabled={
                    updateLoading ||
                    (structureChanges.addColumns.length === 0 &&
                      structureChanges.dropColumns.length === 0 &&
                      structureChanges.modifyColumns.length === 0)
                  }
                  className="flex-1 cursor-pointer"
                >
                  {updateLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Đang cập nhật...
                    </span>
                  ) : (
                    "Áp dụng thay đổi"
                  )}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-400">
            Không thể tải cấu trúc bảng
          </div>
        )}
      </div>
    </Modal>
  );
}

function Database({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}
