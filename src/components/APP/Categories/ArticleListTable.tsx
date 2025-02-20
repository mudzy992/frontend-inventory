import { useState, useEffect, FC } from 'react';
import { Table, Input, Pagination, Tag } from 'antd';
import ArticleType from '../../../types/ArticleType';
import dayjs from 'dayjs';
import {  SearchOutlined } from '@ant-design/icons';
import { useApi } from '../../../API/api';

interface StockProps {
    stockId: number;
}

const ArticleListTable: FC<StockProps> = ({ stockId }) => {
  const { api } = useApi();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api(
          `/api/article/s/${stockId}?perPage=${itemsPerPage}&page=${currentPage}&query=${searchQuery}`,
          'get',
          undefined,
          'administrator'
        );
        setData(response.data.results);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stockId, currentPage, itemsPerPage, searchQuery]);

  const responsibilityStatus = (status:string) => {
    if(status === 'zaduženo') {
        return(
            <Tag className='rounded-xl' color='green'>{status}</Tag>
        )
    } else if(status === 'razduženo'){
        return(
            <Tag className='rounded-xl' color='cyan'>razduženo</Tag>
        )
    } else if(status === 'otpisano'){
        return(
            <Tag className='rounded-xl' color='red'>otpisano</Tag>
        )
    }
  }

  const columns = [
    {
        title: 'Korisnik',
        key: 'user',
        render: (record: ArticleType) => (
            record ? (
                <a rel="noopener noreferrer" href={`#/profile/${record.user?.userId}`}>{record.user?.fullname}</a>
            ) : ('N/A')),
      },
    {
      title: 'Serijski broj',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (serialNumber: string) => (
        <a rel="noopener noreferrer" href={`#/article/${serialNumber}`}>{serialNumber}</a>
      )
    },
    {
      title: 'Inventurni broj',
      dataIndex: 'invNumber',
      key: 'invNumber',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status:string) => (
        responsibilityStatus(status)
      ),
    },
    {
      title: 'Vrijme akcije',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp:string) => <span>{dayjs(timestamp).format('DD.MM.YYYY HH:mm')}</span>
    },

  ];

  const handleSearch = (e:any) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page:any, pageSize:any) => {
    setCurrentPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div >
      <div className="mb-4 flex justify-between items-center">
        <Input
            prefix={<SearchOutlined />}
          placeholder="Traži artikal..."
          value={searchQuery}
          onChange={handleSearch}
          className="lg:w-1/3"
        />
      </div>
        <Table
            size='middle'
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: "max-content" }}
        />
      <div className="mt-4 flex justify-end">
        <Pagination
          current={currentPage}
          total={total}
          pageSize={itemsPerPage}
          showSizeChanger
          onChange={handlePageChange}
          size='small'
        />
      </div>
    </div>
  );
};

export default ArticleListTable;
