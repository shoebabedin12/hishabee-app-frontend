import {
  MinusCircleOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import PaymentTableModal from "../components/UI/PaymentTableModal";

const { Option } = Select;

const EditableCell = ({
  title,
  editing,
  dataIndex,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === 'number' ? (
      <InputNumber />
    ) : dataIndex === 'payingDate'  ? (
      <DatePicker format="YYYY-MM-DD HH:mm:ss" />
    ) : (
      <Input />
    );

  const getInitialValue = () => {
    if (dataIndex === 'payingDate') {
      return record[dataIndex] ? dayjs(record[dataIndex]) : null;
    }
    if (dataIndex === 'month' || dataIndex === 'startDate') {
      return record[dataIndex] ? dayjs(record[dataIndex]) : null;
    }
    return record[dataIndex];
  };

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
          initialValue={getInitialValue()}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const getCurrentMonthYear = () => {
  const currentDate = new Date();
  return { month: currentDate.getMonth() + 1, year: currentDate.getFullYear() };
};

const Home = () => {
  const api = process.env.REACT_APP_API_KEY;
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [client, setClient] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paidClientsCount, setPaidClientsCount] = useState(0);
  const [allClientsCount, setAllClientsCount] = useState(0);
  const [pendingClientsCount, setPendingClientsCount] = useState(0);
  const [paymentPendingData, setPaymentPendingData] = useState([]);
  const [paymentNeededData, setPaymentNeededData] = useState([]);
  const [selectedUserPaymentDetails, setSelectedUserPaymentDetails] = useState(
    []
  );
  const [lastFetchedMonthYear, setLastFetchedMonthYear] = useState({
    month: 0,
    year: 0
  });

  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };
  const start = () => {
    setLoading(true);
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const hasSelected = selectedRowKeys.length > 0;

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close
    }) => (
      <div
        style={{
          padding: 8
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block"
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      )
  });
  const edit = (record) => {
    form.setFieldsValue({
      month: record.month,
      startDate: record.startDate,
      payingDate: record.payingDate,
      paymentStatus: record.paymentStatus
    });
    setEditingKey(record.key);
  };
  const singleDelete = async (record) => {
    try {
      const deleteClientId = record.key; // Assuming the key represents the client ID

      // Make the DELETE request with the client ID in the request body
      await axios
        .delete(`${api}/user/delete-client`, { data: { id: deleteClientId } })
        .then((res) => {
          messageApi.open({
            type: "warning",
            content: res?.data.message
          });
        })
        .catch((err) => {
          console.log(err);
        });

      // If the deletion is successful, update the client state
      const updatedClient = client.filter((item) => item.key !== record.key);
      setClient(updatedClient);
    } catch (error) {
      console.error("Error deleting client:", error);
      // Handle errors if necessary
    }
  };
  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const index = client.findIndex((item) => key === item.key);
      if (index > -1) {
        const updatedClient = {
          ...client[index],
          ...row,
          key
        };

        const response = await axios.put(
          `${api}/user/update-client`,
          updatedClient
        );

        if (response.status === 200) {
          // If the update was successful, update the client state with the updated data
          const newData = [...client];
          newData[index] = updatedClient;
          setClient(newData);
          setEditingKey("");

          message.success("Client data updated successfully");
        } else {
          // Handle error if the update was not successful
          message.error("Failed to update client data");
        }
      } else {
        // Handle case if the item to update is not found
        message.error("Item not found");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };


  const handleGenerateInvoice = (record) => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    console.log(record);

    // Add content to the invoice
    doc.setFontSize(12);
    doc.text('Invoice', 20, 10);

    // Client Information
    doc.text(`Client: ${record.month}`, 20, 20);
    // doc.text(`Address: ${record.clientAddress}`, 20, 30);

    // Invoice Details Table
    const tableRows = record.items.map((item, index) => [
      index + 1,
      item.description,
      item.quantity,
      item.unitPrice,
      item.totalPrice,
    ]);

    doc.autoTable({
      startY: 50,
      head: [['#', 'Description', 'Quantity', 'Unit Price', 'Total Price']],
      body: tableRows,
    });

    // Total Amount
    const totalAmount = record.items.reduce((acc, item) => acc + item.totalPrice, 0);
    doc.text(`Total Amount: ${totalAmount}`, 150, doc.lastAutoTable.finalY + 10);

    // Save the PDF with a specific name
    doc.save('invoice.pdf');
  };

  // main form
  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      editable: true,
      ...getColumnSearchProps("month")
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      editable: true,
      ...getColumnSearchProps("startDate")
    },
    {
      title: "Paying Date",
      dataIndex: "payingDate",
      editable: true,
      ...getColumnSearchProps("payingDate")
    },
    {
      title: "Total Amount",
      dataIndex: "totalPrice",
      editable: false,
      ...getColumnSearchProps("totalPrice")
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      editable: false,
      ...getColumnSearchProps("paymentStatus"),
      render: (_, { paymentStatus }) => {
        let color = paymentStatus.length > 5 ? "red" : "green";
        return (
          <Tag color={color} key={paymentStatus}>
            {paymentStatus.toUpperCase()}
          </Tag>
        );
      }
    },

    {
      title: "operation",
      dataIndex: "operation",
      ellipsis: true,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <Typography.Link onClick={() => showModal(record)}>
              View
            </Typography.Link>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              Edit
            </Typography.Link>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => singleDelete(record)}
            >
              Delete
            </Typography.Link>
            <Button
            disabled={editingKey !== ""} onClick={handleGenerateInvoice}
          >
            Print
          </Button>
          </Space>
        );
      }
    }
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex && "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      }),
      render: (text, record) => {
        const dataLabel = `${col.title}`; // Custom label combining column title and record key
        return {
          children: <span data-label={dataLabel}>{text}</span>
        };
      }
    };
  });

  const onFinish = async (values) => {
    console.log("Received values of form:", values);
    await axios
      .post(`${api}/user/add-client`, values)
      .then((response) => {
        console.log(response);
        if (response?.status === 200) {
          messageApi.open({
            type: "success",
            content: response?.data.message
          });
          form.resetFields();
        }
      })
      .catch((error) => {
        messageApi.open({
          type: "error",
          content: error.response.data.message
        });
        console.log(error);
      });
  };
  // main form

  const showModal = (record) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };



  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const response = await axios.get(
          `${api}/user/all-client-payments-status`
        );
        // console.log("Pending payments response:", response.data);

        // Check if response.data is defined and contains pendingPayments
        // console.log("Response data:", response.data);
        if (!response.data || !Array.isArray(response.data.pendingPayments)) {
          // console.error("Invalid response format:", response.data);
          return;
        }

        const currentMonthYear = getCurrentMonthYear();

        // Update last fetched month and year
        setLastFetchedMonthYear(currentMonthYear);
        // console.log("Last fetched month and year updated.");
      } catch (error) {
        console.error("Error fetching or processing pending payments:", error);
      }
    };

    // Check if last fetched month and year differ from current month and year
    if (
      lastFetchedMonthYear.month !== getCurrentMonthYear().month ||
      lastFetchedMonthYear.year !== getCurrentMonthYear().year
    ) {
      fetchPendingPayments();
    }
  }, [lastFetchedMonthYear, api, loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${api}/user/all-client`);
        // console.log(response.data.data);
        setClient(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData(); // Call the async function immediately
  }, [loading, form]);

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().endOf("day");
  };

  return (
    <>
      {contextHolder}
      <Row gutter={16} wrap align="middle">
        <Col className="gutter-row" span={6} lg={6} md={6} sm={12} xs={24}>
          <Button
            danger
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </Col>

        <Col span={24}>
          <Form name="dynamic_form_nest_item" onFinish={onFinish} form={form}>
            <div
              style={{
                marginBottom: 16
              }}
            >
              <Button
                type="primary"
                onClick={start}
                // disabled={!hasSelected}
                loading={loading}
              >
                Reload
              </Button>
              <span
                style={{
                  marginLeft: 8
                }}
              >
                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
              </span>
            </div>
            <Table
              loading={loading}
              components={{
                body: {
                  cell: EditableCell
                }
              }}
              bordered
              dataSource={client}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={{
                onChange: cancel
              }}
              scroll={{
                y: 500
              }}
            />
            <Form.List name="users">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      wrap
                      key={key}
                      style={{
                        marginTop: 10
                      }}
                      align="baseline"
                    >
                      <Form.Item
                        style={{ width: "100%" }}
                        {...restField}
                        name={[name, "month"]}
                        fieldKey={[name, "month"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing month"
                          }
                        ]}
                      >
                        <DatePicker picker="month" />
                      </Form.Item>
                      <Form.Item
                        style={{ width: "100%" }}
                        {...restField}
                        name={[name, "startDate"]}
                        fieldKey={[name, "startDate"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing last MAC Address"
                          }
                        ]}
                      >
                        <DatePicker onChange={onChange} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      style={{
                        marginTop: 10
                      }}
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add field
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <PaymentTableModal
        selectedUser={selectedUser}
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        modalForm={modalForm}
        messageApi={messageApi}
        client={client}
        setClient={setClient}
      />
    </>
  );
};

export default Home;
