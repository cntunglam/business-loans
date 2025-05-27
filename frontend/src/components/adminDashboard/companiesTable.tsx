import { Button, Checkbox, Dropdown, Input, Menu, MenuButton, MenuItem, Table } from "@mui/joy";
import { CompanyStatusEnum, CompanyTypeEnum, CountriesEnum } from "@roshi/shared";
import { useState } from "react";
import { useAddCompany, useGetCompanies, useUpdateCompany } from "../../api/useAdminApi";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";
import { RsSelect } from "../shared/rsSelect";

export const CompaniesTable = () => {
  const { data: companies, refetch } = useGetCompanies({ filters: { type: CompanyTypeEnum.MONEYLENDER } });
  const updateCompany = useUpdateCompany();
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const { mutation: addCompany, state, setState, clearState } = useAddCompany();

  return (
    <Flex y>
      {addCompanyOpen && (
        <RsModal
          onClose={() => {
            clearState();
            setAddCompanyOpen(false);
          }}
          title="Add Company"
        >
          <Input placeholder="Name" value={state.name} onChange={(e) => setState({ name: e.target.value })} />
          <RsSelect
            placeholder="Company type"
            values={Object.values(CompanyTypeEnum)}
            value={state.type}
            setValue={(val) => setState({ type: val as CompanyTypeEnum })}
          />
          <RsSelect
            placeholder="Country"
            values={Object.values(CountriesEnum)}
            value={state.country}
            setValue={(val) => setState({ country: val as CountriesEnum })}
          />
          <Flex x gap1>
            <Input placeholder="Logo URL" value={state.logo} onChange={(e) => setState({ logo: e.target.value })} />
            <img width={"50px"} src={state.logo} alt="logo" />
          </Flex>
          <Button
            onClick={() =>
              addCompany.mutateAsync().then(() => {
                refetch();
                setAddCompanyOpen(false);
              })
            }
          >
            Submit
          </Button>
        </RsModal>
      )}
      <Flex x yc py={1}>
        <Button onClick={() => setAddCompanyOpen(true)}>Add Company</Button>
      </Flex>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th style={{ textAlign: "center" }}>Logo</th>
            <th>Name</th>
            <th>Type</th>
            <th>Country</th>
            <th>Frozen</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {companies?.map((company) => (
            <tr key={company.id}>
              <td>{company.id}</td>
              <td align="center">
                <img
                  src={company.logo}
                  height="50px"
                  style={{ objectFit: "contain", maxWidth: "200px" }}
                  alt="lender-logo"
                />
              </td>
              <td>{company.name}</td>
              <td>
                <Dropdown>
                  <MenuButton>{company.type}</MenuButton>
                  <Menu>
                    {Object.values(CompanyTypeEnum).map((type) => (
                      <MenuItem
                        key={type}
                        onClick={() => updateCompany.mutateAsync({ id: company.id, type }).then(() => refetch())}
                      >
                        {type}
                      </MenuItem>
                    ))}
                  </Menu>
                </Dropdown>
              </td>
              <td>
                <Dropdown>
                  <MenuButton>{company.country}</MenuButton>
                  <Menu>
                    {Object.values(CountriesEnum).map((country) => (
                      <MenuItem
                        key={country}
                        onClick={() => updateCompany.mutateAsync({ id: company.id, country }).then(() => refetch())}
                      >
                        {country}
                      </MenuItem>
                    ))}
                  </Menu>
                </Dropdown>
              </td>
              <td>
                <Checkbox
                  checked={!!company.isFrozenAt}
                  onChange={(e) =>
                    updateCompany.mutateAsync({ id: company.id, isFrozen: e.target.checked }).then(() => refetch())
                  }
                />
              </td>
              <td>
                <Dropdown>
                  <MenuButton>{company.status}</MenuButton>
                  <Menu>
                    <MenuItem
                      disabled={company.status !== CompanyStatusEnum.ACTIVE}
                      onClick={() =>
                        updateCompany
                          .mutateAsync({ id: company.id, status: CompanyStatusEnum.DELETED })
                          .then(() => refetch())
                      }
                    >
                      Disable
                    </MenuItem>
                    <MenuItem
                      disabled={company.status !== CompanyStatusEnum.DELETED}
                      onClick={() =>
                        updateCompany
                          .mutateAsync({ id: company.id, status: CompanyStatusEnum.ACTIVE })
                          .then(() => refetch())
                      }
                    >
                      Enable
                    </MenuItem>
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
