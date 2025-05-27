import { Button, Checkbox, Input, Typography } from "@mui/joy";
import { NotificationTypeEnum, NotificationTypeEnumLabels } from "@roshi/shared";
import { FC, useState } from "react";
import { useGetCompanyNotificationSettings, useUpdateNotificationSettings } from "../../api/useCompanyApi";
import { Flex } from "../shared/flex";

const LENDER_EMAIL_NOTIFICATIONS = [
  NotificationTypeEnum.APPOINTMENT_CANCELED,
  NotificationTypeEnum.APPOINTMENT_SCHEDULED,
  NotificationTypeEnum.NEW_LOAN_REQUEST,
  NotificationTypeEnum.OFFER_SELECTED,
] as const;

const LENDER_WEBHOOK_NOTIFICATIONS = [
  NotificationTypeEnum.APPOINTMENT_CANCELED,
  NotificationTypeEnum.APPOINTMENT_SCHEDULED,
  NotificationTypeEnum.OFFER_SELECTED,
] as const;

interface Props {
  notificationSettings?: NonNullable<ReturnType<typeof useGetCompanyNotificationSettings>["data"]>;
  refetch: () => void;
}

export const LenderNotificationSettings: FC<Props> = ({ notificationSettings, refetch }) => {
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    notificationSettings?.emailNotificationsEnabled || false
  );
  const [emailAddress, setEmailAddress] = useState(notificationSettings?.emails[0]);
  const [emailNotificationTypes, setEmailNotificationTypes] = useState<NotificationTypeEnum[]>(
    (notificationSettings?.emailNotificationTypes as NotificationTypeEnum[]) || []
  );
  const [webhookNotificationsEnabled, setWebhookNotificationsEnabled] = useState(
    notificationSettings?.webhookNotificationsEnabled || false
  );
  const [webhookNotificationTypes, setWebhookNotificationTypes] = useState<NotificationTypeEnum[]>(
    (notificationSettings?.webhookNotificationTypes as NotificationTypeEnum[]) || []
  );
  const [webhookUrl, setWebhookUrl] = useState(notificationSettings?.webhooks[0]);

  const updateNotificationSettings = useUpdateNotificationSettings();

  return (
    <Flex y>
      <Button
        sx={{ my: 1, width: "150px" }}
        loading={updateNotificationSettings.isPending}
        onClick={() =>
          updateNotificationSettings
            .mutateAsync({
              emailNotificationTypes: emailNotificationsEnabled ? emailNotificationTypes : [],
              webhookNotificationTypes: webhookNotificationsEnabled ? webhookNotificationTypes : [],
              emails: emailAddress ? [emailAddress] : [],
              webhooks: webhookUrl ? [webhookUrl] : [],
              emailNotificationsEnabled,
              webhookNotificationsEnabled,
            })
            .then(() => refetch())
        }
      >
        Save changes
      </Button>
      <Flex y gap1 xst>
        <Flex x gap3 yc p={1} sx={{ backgroundColor: "background.level2" }} fullwidth>
          <Checkbox
            checked={emailNotificationsEnabled}
            onChange={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
          />
          <Typography level="h4">Email notifications</Typography>
        </Flex>
        {emailNotificationsEnabled && (
          <Flex y yc p={1} px={2} sx={{ position: "relative" }}>
            <Typography level="body-sm">Email address</Typography>
            <Input size="sm" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />

            {LENDER_EMAIL_NOTIFICATIONS.map((type) => (
              <Checkbox
                label={NotificationTypeEnumLabels[type]}
                key={type}
                sx={{ my: 0.5 }}
                checked={emailNotificationTypes.includes(type as NotificationTypeEnum)}
                onChange={() =>
                  setEmailNotificationTypes(
                    emailNotificationTypes.includes(type as NotificationTypeEnum)
                      ? emailNotificationTypes.filter((t) => t !== (type as NotificationTypeEnum))
                      : [...emailNotificationTypes, type as NotificationTypeEnum]
                  )
                }
              />
            ))}
          </Flex>
        )}

        <Flex x gap3 yc p={1} sx={{ backgroundColor: "background.level2" }} fullwidth>
          <Checkbox
            checked={webhookNotificationsEnabled}
            onChange={() => setWebhookNotificationsEnabled(!webhookNotificationsEnabled)}
          />
          <Typography level="h4">Webhook notifications</Typography>
        </Flex>
        {webhookNotificationsEnabled && (
          <Flex y yc p={1} px={2}>
            <Typography level="body-sm">Webhook URL</Typography>
            <Input size="sm" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />

            {LENDER_WEBHOOK_NOTIFICATIONS.map((type) => (
              <Checkbox
                label={NotificationTypeEnumLabels[type]}
                key={type}
                sx={{ my: 0.5 }}
                checked={webhookNotificationTypes.includes(type as NotificationTypeEnum)}
                onChange={() =>
                  setWebhookNotificationTypes(
                    webhookNotificationTypes.includes(type as NotificationTypeEnum)
                      ? webhookNotificationTypes.filter((t) => t !== (type as NotificationTypeEnum))
                      : [...webhookNotificationTypes, type as NotificationTypeEnum]
                  )
                }
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
