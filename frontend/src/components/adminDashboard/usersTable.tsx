import { Button, Checkbox, Dropdown, Input, Menu, MenuButton, MenuItem, Option, Select, Table } from "@mui/joy";
import { UserRoleEnum, UserStatusEnum } from "@roshi/shared";
import { useState } from "react";
import { useGetCompanies, useGetUsers, useUpdateUser } from "../../api/useAdminApi";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { AddUserModal } from "./addUserModal";

export const UsersTable = () => {
  const {
    query: { data: users, refetch, isLoading },
    setParams,
    params,
    clearParams,
  } = useGetUsers();
  const { data: companies } = useGetCompanies();

  const [addUserOpen, setAddUserOpen] = useState(false);
  const updateUser = useUpdateUser();

  return (
    <Flex y>
      <LoadingPage variant="overlay" isLoading={isLoading} />
      {addUserOpen && (
        <AddUserModal
          onClose={() => {
            setAddUserOpen(false);
            refetch();
          }}
        />
      )}
      <Flex x yc py={1} gap1 wrap>
        <Button onClick={() => setAddUserOpen(true)}>Add User</Button>
        <Input
          placeholder="Search by name"
          value={params.name || ""}
          onChange={(e) => setParams({ name: e.target.value })}
        />
        <Input
          placeholder="Search by email"
          value={params.email || ""}
          onChange={(e) => setParams({ email: e.target.value })}
        />
        <Select
          placeholder="Search by company"
          onChange={(_, val) => setParams({ companyId: val || undefined })}
          value={params.companyId}
        >
          {companies?.map((comp) => (
            <Option key={comp.id} value={comp.id}>
              {comp.name}
            </Option>
          ))}
        </Select>
        <Checkbox
          label="Show borrowers"
          checked={params?.showBorrowers || false}
          onChange={(e) => setParams({ showBorrowers: e.target.checked })}
        />
        <Button color="neutral" variant="soft" onClick={() => clearParams()}>
          Clear filters
        </Button>
      </Flex>
      <Table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <Dropdown>
                  <MenuButton>{user.role}</MenuButton>
                  <Menu>
                    {[
                      UserRoleEnum.BORROWER,
                      UserRoleEnum.ADMIN,
                      UserRoleEnum.CUSTOMER_SUPPORT,
                      UserRoleEnum.LENDER,
                      UserRoleEnum.AFFILIATE,
                    ].map((role) => (
                      <MenuItem
                        key={role}
                        onClick={() => updateUser.mutateAsync({ id: user.id, role }).then(() => refetch())}
                      >
                        {role}
                      </MenuItem>
                    ))}
                  </Menu>
                </Dropdown>
              </td>
              <td>
                <Dropdown>
                  <MenuButton>{user.status}</MenuButton>
                  <Menu>
                    <MenuItem
                      disabled={user.status !== UserStatusEnum.ACTIVE}
                      onClick={() =>
                        updateUser.mutateAsync({ id: user.id, status: UserStatusEnum.DELETED }).then(() => refetch())
                      }
                    >
                      Disable
                    </MenuItem>
                    <MenuItem
                      disabled={user.status !== UserStatusEnum.DELETED}
                      onClick={() =>
                        updateUser.mutateAsync({ id: user.id, status: UserStatusEnum.ACTIVE }).then(() => refetch())
                      }
                    >
                      Enable
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </td>
              <td>
                <Dropdown>
                  <MenuButton>{user.company?.name || "N/A"}</MenuButton>
                  <Menu>
                    {user?.companyId && (
                      <MenuItem
                        color="danger"
                        disabled={user.status !== UserStatusEnum.ACTIVE}
                        onClick={() => updateUser.mutateAsync({ companyId: null, id: user.id }).then(() => refetch())}
                      >
                        Remove from {user.company?.name}
                      </MenuItem>
                    )}
                    {companies?.map((company) => {
                      return (
                        <MenuItem
                          key={company.id}
                          onClick={() =>
                            updateUser.mutateAsync({ id: user.id, companyId: company.id }).then(() => refetch())
                          }
                        >
                          Assign to {company.name}
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Flex>
  );
};
