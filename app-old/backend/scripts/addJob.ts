import { NotificationTransportEnum, NotificationTypeEnum, UserRoleEnum } from '@roshi/shared';
import { getLoanRequestByUserId } from '../services/loanRequest.service';
import { sendNotification } from '../services/notification.service';

const TEST_USER_ID = '0e0e159b-7a53-47e9-aa27-94d23e9d2c6a';

(async () => {
  const loanRequest = await getLoanRequestByUserId(TEST_USER_ID);
  await sendNotification({
    notificationType: NotificationTypeEnum.WELCOME,
    payload: { loanRequestId: loanRequest.id },
    targetType: UserRoleEnum.BORROWER,
    transport: NotificationTransportEnum.WHATSAPP,
    phoneNumber: loanRequest.user.phone || '',
  });
})();
