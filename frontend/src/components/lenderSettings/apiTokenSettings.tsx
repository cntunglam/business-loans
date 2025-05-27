import { Button, Table } from "@mui/joy";
import { useState } from "react";
import { useDeleteAPIToken, useGetMyAPITokens } from "../../api/useTokenApi";
import { OpenDialog } from "../../context/DialogContainer";
import { Flex } from "../shared/flex";
import { GenerateApiTokenModal } from "./generateApiTokenModal";

export const ApiTokenSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deleteToken = useDeleteAPIToken();
  const { data: myTokens, refetch } = useGetMyAPITokens();

  return (
    <>
      {isModalOpen && <GenerateApiTokenModal onClose={() => setIsModalOpen(false)} refetch={refetch} />}
      <Flex y xst gap2 mt={4}>
        <Button onClick={() => setIsModalOpen(true)}>Generate API token</Button>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Token</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myTokens?.map((token) => (
              <tr key={token.id}>
                <td>{token.name}</td>
                <td>{token.token}</td>
                <td>
                  <Button
                    variant="soft"
                    color="danger"
                    onClick={() =>
                      OpenDialog({
                        type: "delete",
                        title: "Are you sure you want to delete this token?",
                        body: "This action cannot be undone",
                        submit: () => deleteToken.mutateAsync(token.id).then(() => refetch()),
                      })
                    }
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Flex>
    </>
  );
};
