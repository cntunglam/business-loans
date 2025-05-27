import { Button, Input } from "@mui/joy";
import { FC } from "react";
import { useAddUser } from "../../api/useAdminApi";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
}

export const AddUserModal: FC<Props> = ({ onClose }) => {
  const { mutation: addUser, state, setState } = useAddUser();

  return (
    <RsModal
      onClose={() => {
        onClose();
      }}
      title="Add User"
    >
      <Input placeholder="Email" value={state.email} onChange={(e) => setState({ email: e.target.value })} />
      <Button
        disabled={!state.email}
        onClick={() =>
          addUser.mutateAsync().then(() => {
            onClose();
          })
        }
      >
        Submit
      </Button>
    </RsModal>
  );
};
