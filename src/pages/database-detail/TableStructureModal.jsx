import { Loader2, Plus, Trash, Code, Settings, Eye, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";

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
}) {
  if (!isOpen) return null;

  const tabs = [
    { id: "view", name: "Xem cấu trúc", icon: Eye },
    { id: "add", name: "Thêm cột", icon: Plus },
    { id: "modify", name: "Sửa/Xóa", icon: Settings },
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
              <div className="space-y-4">
                {/* Columns */}
                <div className="overflow-y-auto max-h-56">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Database size={18} className="text-emerald-500" />
                    Các cột ({structure.columns?.length || 0})
                  </h3>
                  <div className="overflow-x-auto border border-slate-700 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Tên
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Kiểu
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Null
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Key
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Default
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
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
                            <td className="px-4 py-3 text-white font-medium">
                              {col.Field}
                            </td>
                            <td className="px-4 py-3 text-emerald-400">
                              {col.Type}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {col.Null}
                            </td>
                            <td className="px-4 py-3">
                              {col.Key && (
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">
                                  {col.Key}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {col.Default || (
                                <span className="text-slate-500 italic">
                                  null
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {col.Extra}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Indexes */}
                {structure.indexes && structure.indexes.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">
                      Indexes ({structure.indexes.length})
                    </h3>
                    <div className="overflow-x-auto border border-slate-700 rounded-lg max-h-48">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                              Key Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                              Column
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                              Unique
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
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
                              <td className="px-4 py-3 text-white">
                                {idx.Key_name}
                              </td>
                              <td className="px-4 py-3 text-emerald-400">
                                {idx.Column_name}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    idx.Non_unique === 0
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-slate-700 text-slate-400"
                                  }`}
                                >
                                  {idx.Non_unique === 0 ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-300">
                                {idx.Index_type}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Create Statement */}
                {structure.createStatement && (
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Code size={18} className="text-purple-500" />
                      CREATE Statement
                    </h3>
                    <pre className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto max-h-48">
                      {structure.createStatement}
                    </pre>
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
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="mt-4 w-full cursor-pointer"
                  >
                    <Plus size={16} className="mr-2" />
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
                  Click vào cột để đánh dấu xóa. Các cột được đánh dấu sẽ có màu
                  đỏ.
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {structure.columns?.map((col, idx) => {
                    const markedForDrop = structureChanges.dropColumns.includes(
                      col.Field
                    );
                    return (
                      <div
                        key={idx}
                        className={`border rounded-lg p-3 transition-colors ${
                          markedForDrop
                            ? "bg-red-500/10 border-red-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-medium ${
                                markedForDrop
                                  ? "text-red-400 line-through"
                                  : "text-white"
                              }`}
                            >
                              {col.Field}
                            </span>
                            <span className="text-emerald-400 text-sm">
                              {col.Type}
                            </span>
                            {col.Key && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded">
                                {col.Key}
                              </span>
                            )}
                          </div>
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
