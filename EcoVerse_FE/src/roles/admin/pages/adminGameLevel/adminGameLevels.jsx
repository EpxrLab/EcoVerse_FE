import { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Input,
  Form,
  Select,
  InputNumber,
  Switch,
  Upload,
  Popconfirm,
  Tag,
  Dropdown,
  Card,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  addNewGameLevel,
  addNewGameType,
  deleteGameType,
  getAllGameLevels,
  getAllGameTypes,
  updateGameLevel,
  updateGameType,
  uploadIconImage,
  deleteGameLevel,
} from "../../services";
import toast from "react-hot-toast";

const { TextArea } = Input;

const GAME_TYPE_OPTIONS = [
  { value: "RUN_SORTING", label: "Chạy & phân loại (RUN_SORTING)" },
  { value: "COLLECT_SORTING", label: "Thu gom & phân loại (COLLECT_SORTING)" },
  { value: "GRABBER_SORTING", label: "Gắp & phân loại (GRABBER_SORTING)" },
];

const WASTE_CATEGORIES = [
  { value: "RECYCLABLE", label: "Tái chế", color: "blue" },
  { value: "ORGANIC", label: "Hữu cơ", color: "green" },
  { value: "HAZARDOUS", label: "Nguy hại", color: "red" },
  { value: "GENERAL", label: "Thường", color: "default" },
];

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Dễ", color: "green" },
  { value: "MEDIUM", label: "Trung bình", color: "orange" },
  { value: "HARD", label: "Khó", color: "red" },
];

const DIFFICULTY_TAG_COLOR = { EASY: "green", MEDIUM: "orange", HARD: "red" };
const DIFFICULTY_LABEL = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };

function GameTypeTab({ gameTypes, setGameTypes, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      shortDescription: "",
      fullDescription: "",
      howToPlay: "",
      supportsCoin: false,
      maxLevels: 3,
      displayOrder: 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteGameType(id);
      if (res) {
        toast.success(`Xóa game id ${id} thành công!`);
        onRefresh();
      } else {
        toast.error(`Xóa game id ${id} thất bại!`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        const payload = {
          ...values,
          iconUrl: values.iconUrl?.split("%")[0],
          thumbnailUrl: values.thumbnailUrl?.split("%")[0],
        };
        const res = await updateGameType(editingItem.id, payload);
        if (res) {
          toast.success("Đã cập nhật loại game");
          onRefresh();
        } else {
          toast.error("Cập nhật loại game thành công!");
        }
      } else {
        const res = await addNewGameType(values);
        if (res) {
          toast.success("Tạo loại game mới thành công!");
          onRefresh();
        } else {
          toast.error("Tạo game mới thất bại!");
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }, fieldName) => {
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await uploadIconImage(data);
      const imageUrl = res?.data?.url;

      if (imageUrl) {
        form.setFieldsValue({
          [fieldName]: imageUrl,
        });
        toast.success("Tải ảnh lên thành công và đã cập nhật link!");
        onSuccess("ok");
      } else {
        toast.error("Không tìm thấy publicId từ phản hồi!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError(error);
      message.error(`${file.name} tải lên thất bại.`);
    }
  };

  const columns = [
    {
      title: "Icon",
      dataIndex: "iconPresignedUrl",
      key: "iconPresignedUrl",
      render: (_, row) =>
        row.iconPresignedUrl ? (
          <img
            src={row.iconPresignedUrl}
            alt={row.displayName}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
            <TagsOutlined />
          </div>
        ),
    },
    {
      title: "Mã",
      dataIndex: "typeCode",
      key: "typeCode",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Tên Game",
      dataIndex: "name",
      key: "name",
      render: (v) => <span className="font-semibold text-gray-800">{v}</span>,
    },
    {
      title: "Mô tả ngắn",
      dataIndex: "shortDescription",
      key: "shortDescription",
      ellipsis: true,
    },
    {
      title: "Hỗ trợ Coin",
      dataIndex: "supportsCoin",
      key: "supportsCoin",
      align: "center",
      render: (v) =>
        v ? <Tag color="green">Có</Tag> : <Tag color="default">Không</Tag>,
    },
    {
      title: "Màn chơi/cấp",
      dataIndex: "maxLevels",
      key: "maxLevels",
      align: "center",
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => openEdit(record),
              },
              { type: "divider" },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title="Xóa loại game"
                    description="Bạn có chắc chắn muốn xóa loại game này?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <div className="flex items-center w-full text-red-500">
                      <span>Xóa</span>
                    </div>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined className="text-red-500" />,
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="text-gray-400 hover:text-gray-700"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách loại Game
          </h3>
          <p className="text-sm text-gray-500">
            Quản lý các loại game trong hệ thống
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
        >
          Tạo loại Game
        </Button>
      </div>

      <Table
        dataSource={gameTypes}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, showTotal: (t) => `${t} loại game` }}
        className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-medium"
      />

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${editingItem ? "bg-blue-50" : "bg-green-50"}`}
            >
              {editingItem ? (
                <EditOutlined className="text-blue-500" />
              ) : (
                <PlusOutlined className="text-green-500" />
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {editingItem ? "Cập nhật loại Game" : "Tạo loại Game mới"}
              </div>
              <div className="text-sm text-gray-400 font-normal">
                Nhập thông tin chi tiết cho loại game
              </div>
            </div>
          </div>
        }
        width={720}
        centered
        className="[&_.ant-modal-content]:rounded-3xl [&_.ant-modal-content]:overflow-hidden"
        styles={{
          body: { maxHeight: "68vh", overflowY: "auto", paddingTop: 16 },
        }}
        footer={
          <div className="flex gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 rounded-2xl h-12 text-base font-semibold border-2"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="flex-1 rounded-2xl h-12 text-base font-semibold bg-green-500 border-green-500 hover:bg-green-600"
            >
              {editingItem ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="space-y-1">
          <Form.Item
            label="Mã loại game (typeCode)"
            name="typeCode"
            rules={[{ required: true, message: "Vui lòng chọn mã loại game" }]}
          >
            <Select
              placeholder="Chọn loại game hệ thống"
              className="rounded-xl h-11"
              size="large"
            >
              {GAME_TYPE_OPTIONS.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Tên Game"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Tên loại game" className="rounded-xl h-11" />
          </Form.Item>
          <Form.Item label="Mô tả ngắn" name="shortDescription">
            <Input placeholder="Mô tả ngắn gọn" className="rounded-xl h-11" />
          </Form.Item>
          <Form.Item label="Mô tả đầy đủ" name="fullDescription">
            <TextArea
              rows={3}
              placeholder="Mô tả chi tiết game"
              className="rounded-xl"
            />
          </Form.Item>
          <Form.Item label="Cách chơi" name="howToPlay">
            <TextArea
              rows={3}
              placeholder="Hướng dẫn chơi"
              className="rounded-xl"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Thumbnail"
              name="thumbnailUrl"
              getValueFromEvent={() => undefined}
            >
              <Upload
                customRequest={(options) =>
                  handleUpload(options, "thumbnailUrl")
                }
                multiple={false}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} className="rounded-xl">
                  {form.getFieldValue("thumbnailUrl")
                    ? "Đã có ảnh (Bấm để thay đổi)"
                    : "Chọn ảnh thumbnail"}
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Icon"
              name="iconUrl"
              getValueFromEvent={() => undefined}
            >
              <Upload
                customRequest={(options) => handleUpload(options, "iconUrl")}
                multiple={false}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} className="rounded-xl">
                  {form.getFieldValue("iconUrl")
                    ? "Đã có icon (Bấm để thay đổi)"
                    : "Chọn ảnh icon"}
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label="Hỗ trợ Coin"
              name="supportsCoin"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item label="Số màn chơi" name="maxLevels">
              <InputNumber min={0} className="w-full rounded-xl" />
            </Form.Item>
            <Form.Item label="Thứ tự hiển thị" name="displayOrder">
              <InputNumber min={0} className="w-full rounded-xl" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

function PresetTab({ gameTypes }) {
  const [presets, setPresets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [levelAllow, setlevelAllow] = useState(1);
  const [form] = Form.useForm();
  const filteredPresets = presets.filter(
    (p) => p.gameTypeId === selectedGameId,
  );

  const selectedGame = gameTypes.find((g) => g.id === selectedGameId);
  const isNoLivesGame = ["RUN_SORTING", "GRABBER_SORTING"].includes(
    selectedGame?.typeCode,
  );

  const fetchData = async () => {
    try {
      if (!selectedGameId) {
        setPresets([]);
        return;
      }
      const res = await getAllGameLevels(selectedGameId);
      const type = gameTypes.find((item) => item.id === selectedGameId);
      if (type) {
        setlevelAllow(type.maxLevels);
      }
      setPresets(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGameId]);

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      difficulty: "EASY",
      items: [
        {
          levelNumber: 1,
          itemCount: 10,
          timeLimitSeconds: 0,
          lives: isNoLivesGame ? 1 : 3,
          wasteCategories: ["RECYCLABLE"],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteGameLevel(selectedGameId, id);
      if (res) {
        toast.success("Xóa cấp độ thành công!");
        fetchData();
      } else {
        toast.error("Xóa cấp độ thất bại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        items: values.items?.map((item, index) => ({
          ...item,
          levelNumber: index + 1,
          scorePerCorrect: 10,
        })),
      };
      if (editingItem) {
        const res = await updateGameLevel(
          selectedGameId,
          editingItem.id,
          payload,
        );
        if (res) {
          toast.success("Cập nhật preset mới thành công!");
          fetchData();
        } else {
          toast.error("Cập nhật preset mới thất bại!");
        }
      } else {
        const res = await addNewGameLevel(selectedGameId, payload);
        if (res) {
          toast.success("Tạo preset mới thành công!");
          fetchData();
        } else {
          toast.error("Tạo preset mới thất bại!");
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: "Cấp độ",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (v) => (
        <Tag color={DIFFICULTY_TAG_COLOR[v]}>{DIFFICULTY_LABEL[v]}</Tag>
      ),
    },
    {
      title: "Số màn",
      key: "levelCount",
      align: "center",
      render: (_, record) => <Tag>{record.items.length} màn</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => openEdit(record),
              },
              { type: "divider" },
              {
                key: "delete",
                label: (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Popconfirm
                      title="Xóa preset"
                      description="Bạn có chắc chắn muốn xóa preset này?"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <span className="text-red-500">Xóa</span>
                    </Popconfirm>
                  </div>
                ),
                icon: <DeleteOutlined className="text-red-500" />,
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="text-gray-400 hover:text-gray-700"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-dashed border-gray-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn loại Game để quản lý các Cấp Độ:
            </label>
            <Select
              placeholder="-- Chọn loại game --"
              className="w-full md:w-[400px]"
              size="large"
              onChange={(value) => setSelectedGameId(value)}
              allowClear
            >
              {gameTypes.map((gt) => (
                <Select.Option key={gt.id} value={gt.id}>
                  {gt.name} ({gt.typeCode})
                </Select.Option>
              ))}
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            disabled={!selectedGameId} // Disable nếu chưa chọn game
            className={`rounded-xl h-11 font-semibold ${
              !selectedGameId ? "bg-gray-300" : "bg-green-500 border-green-500"
            }`}
          >
            Tạo Cấp Độ
          </Button>
        </div>
      </div>

      {selectedGameId ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Các Cấp Độ của game:{" "}
              <span className="text-blue-600">
                {gameTypes.find((g) => g.id === selectedGameId)?.name}
              </span>
            </h3>
          </div>
          <Table
            dataSource={filteredPresets}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            className="[&_.ant-table-thead_th]:bg-gray-50"
          />
        </>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border">
          <AppstoreOutlined className="text-5xl text-gray-200 mb-4" />
          <p className="text-gray-400 text-base">
            Vui lòng chọn một loại game ở phía trên để xem các cấu hình preset
          </p>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${editingItem ? "bg-blue-50" : "bg-green-50"}`}
            >
              {editingItem ? (
                <EditOutlined className="text-blue-500" />
              ) : (
                <PlusOutlined className="text-green-500" />
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {editingItem ? "Cập nhật Preset" : "Tạo Preset mới"}
              </div>
              <div className="text-sm text-gray-400 font-normal">
                Định nghĩa các tham số, độ khó và loại rác cho game
              </div>
            </div>
          </div>
        }
        width={760}
        centered
        className="[&_.ant-modal-content]:rounded-3xl [&_.ant-modal-content]:overflow-hidden"
        styles={{
          body: { maxHeight: "68vh", overflowY: "auto", paddingTop: 16 },
        }}
        footer={
          <div className="flex gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 rounded-2xl h-12 text-base font-semibold border-2"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="flex-1 rounded-2xl h-12 text-base font-semibold bg-green-500 border-green-500 hover:bg-green-600"
            >
              {editingItem ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="space-y-1">
          {/* Difficulty */}
          <Form.Item
            label="Cấp Độ"
            name="difficulty"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn độ khó" size="large">
              {DIFFICULTY_OPTIONS.map((d) => (
                <Select.Option key={d.value} value={d.value}>
                  {d.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Dynamic Levels */}
          <div className="border rounded-2xl p-4 bg-gray-50/50">
            <div className="text-sm font-semibold text-gray-700 mb-3">
              Danh sách Màn chơi (Levels)
            </div>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      className="border rounded-2xl p-4 bg-white relative"
                    >
                      <div className="absolute top-3 right-3">
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => {
                            if (fields.length <= 1) {
                              toast.error("Phải có ít nhất 1 màn chơi");
                              return;
                            }
                            remove(name);
                          }}
                          size="small"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          Cấu hình Màn chơi
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Form.Item
                          {...restField}
                          label="Màn chơi"
                          name={[name, "levelNumber"]}
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={1}
                            className="w-full"
                            disabled
                            value={index + 1}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label="Số lượng rác"
                          name={[name, "itemCount"]}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} className="w-full" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label="Thời gian (giây)"
                          name={[name, "timeLimitSeconds"]}
                        >
                          <InputNumber min={0} className="w-full" />
                        </Form.Item>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          {...restField}
                          label="Số mạng"
                          name={[name, "lives"]}
                        >
                          <InputNumber
                            min={0}
                            className="w-full"
                            disabled={isNoLivesGame}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label="Loại rác"
                          name={[name, "wasteCategories"]}
                          rules={[
                            {
                              required: true,
                              message: "Chọn ít nhất 1 loại rác",
                            },
                          ]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Chọn loại rác"
                            options={WASTE_CATEGORIES.map((wc) => ({
                              value: wc.value,
                              label: wc.label,
                            }))}
                            tagRender={(props) => {
                              const wc = WASTE_CATEGORIES.find(
                                (w) => w.value === props.value,
                              );
                              return (
                                <Tag
                                  color={wc?.color || "default"}
                                  closable={props.closable}
                                  onClose={props.onClose}
                                  className="mr-1"
                                >
                                  {wc?.label || props.value}
                                </Tag>
                              );
                            }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                  {fields.length < levelAllow ? (
                    <Button
                      type="dashed"
                      onClick={() => {
                        const currentItems = form.getFieldValue("items") || [];
                        const lastItem = currentItems[currentItems.length - 1];
                        const nextItemCount = lastItem
                          ? (lastItem.itemCount || 10) + 2
                          : 10;

                        add({
                          levelNumber: fields.length + 1,
                          itemCount: nextItemCount,
                          timeLimitSeconds: lastItem ? lastItem.timeLimitSeconds : 0,
                          lives: isNoLivesGame ? 1 : 3,
                          wasteCategories: lastItem
                            ? lastItem.wasteCategories
                            : ["RECYCLABLE"],
                        });
                      }}
                      block
                      icon={<PlusOutlined />}
                      className="rounded-2xl h-12 border-2 border-green-200 text-green-600 hover:border-green-400 hover:text-green-700 bg-green-50/50"
                    >
                      Thêm Màn chơi mới
                    </Button>
                  ) : (
                    <div className="text-center p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 font-medium text-sm">
                      Đã đạt tới số lượng màn chơi tối đa ({levelAllow} màn)
                    </div>
                  )}
                </div>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminGameLevels() {
  const [gameTypes, setGameTypes] = useState([]);

  const fetchData = async () => {
    try {
      const res = await getAllGameTypes();
      setGameTypes(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/80 p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
            <AppstoreOutlined className="text-green-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Game</h1>
            <p className="text-sm text-gray-500">
              Quản lý loại game và cấu hình bộ cấp độ
            </p>
          </div>
        </div>

        <Card className="rounded-3xl shadow-sm border-0">
          <Tabs
            defaultActiveKey="gameTypes"
            size="large"
            items={[
              {
                key: "gameTypes",
                label: (
                  <span className="flex items-center gap-2">
                    <AppstoreOutlined />
                    Loại Game
                  </span>
                ),
                children: (
                  <GameTypeTab
                    gameTypes={gameTypes}
                    setGameTypes={setGameTypes}
                    onRefresh={fetchData}
                  />
                ),
              },
              {
                key: "presets",
                label: (
                  <span className="flex items-center gap-2">
                    <TrophyOutlined />
                    Cấp độ Game
                  </span>
                ),
                children: <PresetTab gameTypes={gameTypes} />,
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
