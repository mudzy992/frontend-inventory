import { useEffect, useState } from "react";
import UserType from "../../../types/UserType"
import api, { ApiResponse } from "../../../API/api";
import React from "react";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, 
    Pagination, SortDescriptor, Selection, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User, Chip, ChipProps, Card, CardBody, NextUIProvider, Link } from "@nextui-org/react";


const INITIAL_VISIBLE_COLUMNS = ["fullname", "departmentTitle", "telephone", "locationName", "status"];

const statusColorMap: Record<string, ChipProps["color"]> = {
    aktivan: "success",
    neaktivan: "danger",
  };

interface UserBaseType {
    id: number | undefined,
    userId?: number,
    fullName: string,
    surname: string ,
    forname: string ,
    department: string,
    jobTitle: string,
    locationName: string,
    email: string ,
    localNumber: string,
    telephone: string ,
    gender: string ,
    status: string ,
}

export const UserTable: React.FC<{}> = () => {
    /* Stanja */
    
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true)
    const [message, setMessage] = useState<string>('');
    const [usersData, setUsersData] = useState<UserType[]>();
    const [users, setUsers] = useState<UserBaseType[]>([]);
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "fullname",
        direction: "ascending",
    });

    type User = typeof users[0];

    const [page, setPage] = React.useState(1);

    const hasSearchFilter = Boolean(filterValue);
    const columns = [
        {name: 'Ime i prezime', uid: 'fullname', sortable: true},
        {name: 'Sektor/Odjeljenje', uid: 'departmentTitle', sortable: true},
        {name: 'Radno mjesto', uid: 'jobTitle', sortable: true},
        {name: 'Lokacija', uid: 'locationName', sortable: true},
        {name: 'Email', uid: 'email', sortable: false},
        {name: 'Lokal', uid: 'localNumber', sortable: false},
        {name: 'Telefon', uid: 'telephone', sortable: false},
        {name: 'Spol', uid: 'gender', sortable: false},
        {name: 'Status', uid: 'status', sortable: false},
    ]

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;
    
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
      }, [visibleColumns]);
    
      const filteredItems = React.useMemo(() => {
        let filteredUsers = [...users];
    
        if (hasSearchFilter) {
          filteredUsers = filteredUsers.filter((user) =>
            user.fullName.toLowerCase().includes(filterValue.toLowerCase()),
          );
        }
    
        return filteredUsers;
      }, [users, filterValue, statusFilter]);
    
      const pages = Math.ceil(filteredItems.length / rowsPerPage);
    
      const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
    
        return filteredItems.slice(start, end);
      }, [page, filteredItems, rowsPerPage]);
    
      const sortedItems = React.useMemo(() => {
        return [...items].sort((a: User, b: User) => {
          const first = a[sortDescriptor.column as keyof User] as number;
          const second = b[sortDescriptor.column as keyof User] as number;
          const cmp = first < second ? -1 : first > second ? 1 : 0;
    
          return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
      }, [sortDescriptor, items]);
    
      const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
        const cellValue = user[columnKey as keyof User];
        const inicials = `${user.forname[0]?.toUpperCase() || ''}${user.surname[0]?.toUpperCase() || ''}`;
        let gender;
        if(user.gender = 'muško') {
            gender = 'bi bi-gender-male'
        } else {
            gender = 'bi bi-gender-female'
        }
        const linkUser = `#/admin/userProfile/${user.userId}`
        switch (columnKey) {
          case "fullname":
            return (
              <User
                avatarProps={{radius: "lg", name:inicials, icon: (<i className={gender}/>)}}
                description={user.email}
                name={(<Link isBlock showAnchorIcon color="primary" href={linkUser}>{user.fullName}</Link>)}
              >
                {user.email}
              </User>
            );
          case "departmentTitle":
            return (
              <div className="flex flex-col">
                <p className="text-bold text-small capitalize">{user.department}</p>
                <p className="text-bold text-tiny capitalize text-default-400">{user.jobTitle}</p>
              </div>
            );
          case "telephone":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{user.telephone}</p>
              <p className="text-bold text-tiny capitalize text-default-400">{user.localNumber}</p>
            </div>
          );
          case "status":
            return (
              <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
                {cellValue}
              </Chip>
            );
          default:
            return cellValue;
        }
      }, []);
    
      const onNextPage = React.useCallback(() => {
        if (page < pages) {
          setPage(page + 1);
        }
      }, [page, pages]);
    
      const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
          setPage(page - 1);
        }
      }, [page]);
    
      const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
      }, []);
    
      const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
          setFilterValue(value);
          setPage(1);
        } else {
          setFilterValue("");
        }
      }, []);
    
      const onClear = React.useCallback(()=>{
        setFilterValue("")
        setPage(1)
      },[])

      function capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    
      const topContent = React.useMemo(() => {
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-3 items-end">
              <Input
                isClearable
                className="w-full sm:max-w-[44%]"
                placeholder="Pretraga po imenu..."
                startContent={<i className="bi bi-search"/>}
                value={filterValue}
                onClear={() => onClear()}
                onValueChange={onSearchChange}
              />
              <div className="flex gap-3">
                <Dropdown>
                  <DropdownTrigger className="hidden sm:flex">
                    <Button endContent={<i className="bi bi-arrow-down-short" />} variant="flat">
                      Uključi kolone
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Table Columns"
                    closeOnSelect={false}
                    selectedKeys={visibleColumns}
                    selectionMode="multiple"
                    onSelectionChange={setVisibleColumns}
                  >
                    {columns.map((column) => (
                      <DropdownItem key={column.uid} className="capitalize">
                        {capitalize(column.name)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-default-400 text-small">Ukupno {users.length} korisnika.</span>
              <label className="flex items-center text-default-400 text-small">
                Redova po stranici:
                <select
                  className="bg-transparent outline-none text-default-400 text-small"
                  onChange={onRowsPerPageChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </label>
            </div>
          </div>
        );
      }, [
        filterValue,
        statusFilter,
        visibleColumns,
        onSearchChange,
        onRowsPerPageChange,
        users.length,
        hasSearchFilter,
      ]);
    
      const bottomContent = React.useMemo(() => {
        return (
          <div className="py-2 px-2 flex justify-between items-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
            <div className="hidden sm:flex w-[30%] justify-end gap-2">
              <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                Prethodna
              </Button>
              <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                Sljedeća
              </Button>
            </div>
          </div>
        );
      }, [items.length, page, pages, hasSearchFilter]);

    useEffect(()=>{
        const fatchData = async() => {
            try {
                const userData = await  api('api/user/', 'get', {}, 'administrator')
                .then((res: ApiResponse) => {
                    if (res.status === 'error') {
                        setMessage('Greška prilikom učitavanja korisnika');
                    }
                    if (res.status === 'login') {
                        return setIsLoggedIn(false);
                    }
                    setUsersData(res.data)
                })
            } catch (error) {
                setMessage('Sistemska greška prilikom dohvaćanja podataka o korisnicima. Greška: ' + error)
            }
        }
        fatchData()
    }, [])

    useEffect(() => {
        if (usersData) {
          const newUsersList: UserBaseType[] = usersData.map((user, index) => {
            return {
              id: index,
              userId: user.userId,
              fullName: user.fullname || '',
              department: user.department?.title || '', 
              jobTitle: user.job?.title || '', 
              locationName: user.location?.name || '', 
              email: user.email || '',
              localNumber: user.localNumber || '',
              telephone: user.telephone || '',
              gender: user.gender || '',
              status: user.status || '',
              forname: user.forname || '', 
              surname: user.surname || '',
            };
          });
      
          setUsers(newUsersList);
        }
      }, [usersData]);

    return (
          <Card>
              <CardBody>
                  <Table
                      isHeaderSticky
                      bottomContent={bottomContent}
                      bottomContentPlacement="outside"
                      classNames={{
                          wrapper: "max-h-[382px]",
                      }}
                      sortDescriptor={sortDescriptor}
                      topContent={topContent}
                      topContentPlacement="outside"
                      onSortChange={setSortDescriptor}
                      >
                      <TableHeader columns={headerColumns}>
                          {(column) => (
                          <TableColumn
                              key={column.uid}
                              align={column.uid === "status" ? "center" : "start"}
                              allowsSorting={column.sortable}
                          >
                              {column.name}
                          </TableColumn>
                          )}
                      </TableHeader>
                      <TableBody emptyContent={"Nema pronađenih korisnika"} items={sortedItems}>
                          {(item) => (
                          <TableRow key={item.id}>
                              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                          </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </CardBody>
          </Card>
      );
    }