import { Divider } from '@mui/joy';
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Flex } from "../components/shared/flex";

interface DialogOptions {
  title?: string;
  body?: string;
  type: DialogType;
  submit?: () => void;
  onClose?: () => void;
  image?: string;
}

type DialogType = "delete" | "confirm" | "discard" | "success";

const eventEmitter = (() => {
  let callbackList: ((options: DialogOptions) => unknown)[] = [];

  return {
    on(callback: (options: DialogOptions) => unknown) {
      callbackList.push(callback);
    },
    clear() {
      callbackList = [];
    },
    emit(options: DialogOptions) {
      callbackList.forEach((callback) => {
        callback(options);
      });
    },
  };
})();

export const DialogContainer = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState<DialogType>("confirm");
  const [submitAction, setSubmitAction] = useState<() => void>(() => null);
  const [onClose, setOnClose] = useState<() => void>(() => null);

  const close = () => {
    setIsOpen(false);
    onClose();
  };

  const openDialog = useCallback((dialogOptions: DialogOptions) => {
    if (dialogOptions.title) setTitle(dialogOptions.title);
    else setTitle("");

    if (dialogOptions.body) setBody(dialogOptions.body);
    else setBody("");

    if (dialogOptions.image) setImage(dialogOptions.image);
    else setImage("");

    setSubmitAction(() => dialogOptions.submit);

    setType(dialogOptions.type);
    setIsOpen(true);
    setOnClose(() => dialogOptions.onClose);
  }, []);

  const renderDialogButtons = () => {
    if (type === "discard") {
      return (
        <Flex x yc gap1 alignSelf={"center"} growChildren width="80%">
          <Button size="lg" color="neutral" variant="outlined" onClick={close}>
            Cancel
          </Button>
          <Button
            size="lg"
            color="danger"
            onClick={() => {
              setIsOpen(false);
              submitAction();
            }}
          >
            Discard
          </Button>
        </Flex>
      );
    }
    if (type === "confirm") {
      return (
        <Flex x yc gap1 alignSelf={"center"} growChildren width="80%">
          <Button size="lg" color="neutral" variant="outlined" onClick={close}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={() => {
              setIsOpen(false);
              submitAction();
            }}
          >
            Confirm
          </Button>
        </Flex>
      );
    } else if (type === "delete") {
      return (
        <Flex x yc gap1 alignSelf={"center"} growChildren width="80%">
          <Button size="lg" color="neutral" variant="outlined" onClick={close}>
           {t("cancel")}
          </Button>
          <Button
            size="lg"
            color="danger"
            onClick={() => {
              setIsOpen(false);
              submitAction();
            }}
          >
          {t("delete")}
          </Button>
        </Flex>
      );
    } else if (type === "success") {
      return (
        <Flex x yc gap1 alignSelf={"center"} growChildren width="80%">
          <Button size="lg" color="neutral" variant="outlined" onClick={close}>
            Close
          </Button>
        </Flex>
      );
    }
  };

  const getTitle = () => {
    if (title) return title;

    if (type === "confirm") return "Confirmation";

    if (type === "delete") return "Confirm deletion";

    if (type === "discard") return "Discard changes?";

    return "";
  };

  const getBody = () => {
    if (body) return body;

    if (type === "confirm") return "Are you sure ?";

    if (type === "delete") return "Are you sure you want to delete this item";

    if (type === "discard") return "This can't be undone and you'll lose all changes.";
  };

  useEffect(() => {
    eventEmitter.on(openDialog);

    return () => {
      eventEmitter.clear();
    };
  }, [openDialog]);

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalDialog sx={{ maxWidth: "650px", width: { xs: "95%", sm: "80%", md: "60%" } }}>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Typography mb={2} textAlign={"center"} level={"title-lg"} fontSize={"1.3rem"}>
            {getTitle()}
          </Typography>
          <ModalClose sx={{ position: 'relative', top: 0 }} />
        </Flex>
        <Divider sx={{ width: '100%', margin: 'auto' }} />
        <Flex y xc gap1 py={2} px={{ xs: 0, md: 2 }}>
          {image && <img height="100px" src={image} />}
          <Flex y gap3>
            <Typography textAlign={"center"} textColor="neutral.600" level="body-lg">
              {getBody()}
            </Typography>
            {renderDialogButtons()}
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};

export const OpenDialog = (options: DialogOptions) => {
  eventEmitter.emit(options);
};
