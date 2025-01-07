import { Avatar, Button, Card, Input, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserType from "../../../types/UserType";
import { ApiResponse, useApi } from "../../../API/api";
import { UserRole } from "../../../types/UserRoleType";
import { useUserContext } from "../../UserContext/UserContext";
import { LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { useNotificationContext } from "../../../Notification/NotificationContext";

const AllUsersTable = () => {
    const { api } = useApi();
    const { role } = useUserContext();
    const {error, warning } = useNotificationContext();
    const [users, setUsers] = useState<UserType[]>([]);
    const [filteredData, setFilteredData] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const navigate = useNavigate()

    useEffect(() => {
        fatchUsers();
    }, []);

    useEffect(() => {
        if (searchText === '') {
            setFilteredData(users);
        } else {
            setFilteredData(
                users.filter((user) => {
                    return (
                        user.fullname?.toLowerCase().includes(searchText.toLowerCase())
                    );
                })
            );
    }}, [searchText, users]);

    const handleOpenUserProfile = (userId:number) => {
        navigate(`/user/profile/${userId}`)
    }

    const columns = [
        {key: 'fullname', dataIndex: '', title: 'Ime i prezime', render: (record: UserType) => {
            const inicials = `${record.forname![0].toUpperCase() || ""}${record.surname![0].toUpperCase() || ""}`;
            return (
                <div className="flex flex-row items-center gap-2">
                <Avatar
                size={40}
                className="bg-gray-300 border-1"
                style={{borderRadius:"15px", fontSize:"12px", color:"black"}}
                shape="square"
                > {inicials} </Avatar>
                <Button 
                    onClick={()=>handleOpenUserProfile(record.userId!)} 
                    icon={<LinkOutlined />} 
                    className="rounded-xl" 
                    color="primary" 
                    variant="link"
                >
                    {record.fullname}
                </Button>
                </div>
            )
        }},
        {key: 'departmentTitle', dataIndex: '', title: 'Sektor/Odjeljenje', render: (record: UserType) => (
            <div className="flex flex-col">
                <span>{record.department?.title}</span>
                <span className="text-xs text-gray-400">{record.job?.title}</span>
            </div>
        )},
        {key: 'location', dataIndex: '', title: 'Lokacija', render: (record: UserType) => (
            <div className="flex flex-col">
                <span>{record.location?.name}</span>
                <span className="text-xs text-gray-400">{record.location?.parentLocation?.name}</span>
            </div>
        )},
        {key: 'telephone', title: 'Telefon', render: (record:UserType) => (
            <div className="flex flex-col">
                <span>{record.telephone}</span>
                <span className="text-xs text-gray-400">{record.localNumber}</span>
            </div>
        )},
        {key: 'status', dataIndex: 'status', title: 'Status', render: (text: string) => (
            <Tag className="capitalize" color={text === 'aktivan' ? 'green' : 'red'}>{text}</Tag>
        )},
    ]

    const fatchUsers = async () => {
        setLoading(true);
        try {
            api('/api/user', 'get', undefined, role as UserRole). then(
                async(res: ApiResponse) => {
                    if(res.status === 'forbidden'){
                        error.message('Korisnik nema dovoljno prava za učitavanje podataka')
                        return;
                    }
                    if (res.status === 'error'){
                        error.message('Greška prilikom učitavanja podataka');
                        navigate('/login')
                        return;
                    }
                    if(res.status === 'login'){
                        error.message('Vaša prijava je istekla, molimo prijavite se ponovo!')
                        navigate('/login')
                        return;
                    }
                    setUsers(res.data)
                },
            );
        } catch (err:any){
            error.notification(err.data.message)
            navigate('/login')
        } finally {
            setLoading(false);
        }
    };

    const tableHeader = () => {
        return (
            <div className="flex flex-col gap-3">
                <Input
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Pretraga po imenu i prezimenu"
                className="lg:w-[50%]"
                />
                <span className="text-sm text-gray-400">Ukupno {users.length} korisnika.</span>
            </div>
        )
    }

    return (
        <Card loading={loading} bodyStyle={{padding:0}}>
            <Table
            loading={loading}
            pagination={{style:{marginRight:'12px'}}}
            dataSource={filteredData} 
            columns={columns}
            title={tableHeader}
            scroll={{ x: "max-content" }}
            />
        </Card>
    );
};

export default AllUsersTable;
