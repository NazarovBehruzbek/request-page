import React, { useEffect, useState } from "react";
import { deleteLocalStorage, getToken, tokenKey } from "./Auth";
import axios from "axios";
import { Button, Form, Table, Modal, message, Input, Upload } from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";

function Home() {
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const authToken = getToken(tokenKey);

    const getData = () => {
        axios.get(`https://autoapi.dezinfeksiyatashkent.uz/api/categories`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((response) => {
                setCategories(response.data.data);
            })
            .catch((error) => {
                console.log("Error", error);
            });
    };
    useEffect(() => {
        getData();
    }, []);

    const handleOk = (values) => {
        const formData = new FormData();
        formData.append('name_en', values.name_en);
        formData.append('name_ru', values.name_ru);
        if (values.image_src && values.image_src.length > 0) {
            formData.append('images', values.image_src[0].originFileObj, values.image_src[0].name);
        }
        const url = form.id ? `https://autoapi.dezinfeksiyatashkent.uz/api/categories/${form.id}` : "https://autoapi.dezinfeksiyatashkent.uz/api/categories";
        const method = form.id ? 'PUT' : 'POST';
        const authToken = getToken(tokenKey);
        const headers = {
            'Authorization': `Bearer ${authToken}`,
        };
        axios({
            url: url,
            method: method,
            data: formData,
            headers: headers,
        })
            .then(res => {
                if (res && res.data) {
                    message.success(form.id ? "Category updated successfully" : "Category added successfully");
                    handleCancel();
                    getData();
                } else {
                    message.error("Failed to save category");
                }
            })
            .catch(error => {
                console.error(error);
                message.error("An error occurred while processing the request");
            });
    };

    const beforeUpload = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        const isJpgOrPng = extension === 'jpg' || extension === 'jpeg' || extension === 'png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG files!');
        }
        return isJpgOrPng;
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const showModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const editModal = (item) => {
        setIsModalOpen(true);
        form.setFieldsValue({
            name_en: item.name_en,
            name_ru: item.name_ru,
            image_src: [{ uid: '-1', name: item.image_src, status: 'done', url: item.image_src }],
        });
        form.id = item.id;
    };

    const dataSource = categories.map((item, index) => ({
        key: item.id,
        number: index + 1,
        images: (
            <img src={item.image_src} alt="Error" />
        ),
        id: item.id,
        name_en: item.name_en,
        name_ru: item.name_ru,
        action: (
            <>
                <Button onClick={() => editModal(item)} type="primary">Edit</Button>
                <Button onClick={() => deleteUser(item.id)} type="primary" danger>Delete</Button>
            </>
        )
    }));

    const deleteUser = (id) => {
        console.log(id);
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
        Modal.confirm({
            title: 'Are you sure you want to delete this user?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                axios.delete(`https://autoapi.dezinfeksiyatashkent.uz/api/categories/${id}`, config)
                    .then(res => {
                        if (res && res.data.success) {
                            message.success("User deleted successfully");
                            const updatedUsers = categories.filter(user => user.id !== id);
                            setCategories(updatedUsers);
                        } else {
                            message.error("Failed to delete user");
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting user:", error);
                        message.error("An error occurred while deleting user");
                    });
            },
            onCancel() {
                console.log("Deletion canceled");
            },
        });
    };
    const logOut = ()=>{
        deleteLocalStorage(tokenKey);
        window.location.reload();
        navigate('/login');

    }
    const columns = [
        {
            title: '№',
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name En',
            dataIndex: 'name_en',
            key: 'name_en',
        },
        {
            title: 'Name Ru',
            dataIndex: 'name_ru',
            key: 'name_ru',
        },
        {
            title: 'Harakat',
            dataIndex: 'action',
            key: 'action',
        },
    ];

    return (
        <div className="table-modal" >
            <Button style={{ marginBottom: '30px' }} onClick={showModal} type="primary">Add</Button>
            <Button onClick={logOut}>LOG OUT</Button>
            <Table dataSource={dataSource} columns={columns} />
            <Modal title="Add" visible={isModalOpen} onCancel={handleCancel} footer={null}>
                <Form form={form} name="validateOnly" layout="vertical" autoComplete="off" onFinish={handleOk}>
                    <Form.Item name="name_en" label="Name (English)" rules={[{ required: true, message: 'Please enter the name in English' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="name_ru" label="Name (Russian)" rules={[{ required: true, message: 'Please enter the name in Russian' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Upload Image" name="image_src" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true, message: 'Please upload an image' }]}>
                        <Upload
                            customRequest={({ onSuccess }) => {
                                onSuccess("ok")
                            }}
                            beforeUpload={beforeUpload}
                            listType="picture-card"
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Home;
