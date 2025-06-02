import { Button, Divider, Typography } from '@mui/joy';
import { formatApplicantForAdmin, formatApplicantForBorrower, formatApplicantInfoForLender } from '@roshi/backend';
import { DocumentTypeEnum } from '@roshi/shared';
import { format } from 'date-fns';
import { FC } from 'react';
import { useGetApplicantInfo } from '../../api/useApplicantInfoApi';
import { useGetMyLoanRequest } from '../../api/useLoanRequestApi';
import { ASSETS } from '../../data/assets';
import { formatApplicationData } from '../shared/applicationDataFormatter';
import { Flex } from '../shared/flex';
import { RsModal } from '../shared/rsModal';
import { ViewDocumentBtn } from '../shared/viewDocumentBtn';

interface Props {
  loanRequest?: Pick<NonNullable<ReturnType<typeof useGetMyLoanRequest>['data']>, 'amount' | 'term' | 'purpose'>;
  applicantInfo:
    | ReturnType<typeof formatApplicantForAdmin>
    | ReturnType<typeof formatApplicantForBorrower>
    | ReturnType<typeof formatApplicantInfoForLender>;
  documents?: NonNullable<ReturnType<typeof useGetApplicantInfo>['data']>['documents'];
  onDelete?: () => void;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
}

export const ApplicationDetailsModal: FC<Props> = ({ title, loanRequest, applicantInfo, onDelete, onClose, isLoading, documents }) => {
  const renderTitleAndValue = (title: string, value: string) => {
    return (
      <Flex x xsb>
        <Typography>{title}</Typography> <Typography fontWeight={600}>{value}</Typography>
      </Flex>
    );
  };

  return (
    <RsModal title={title} onClose={onClose} fullscreenOnMobile>
      <Typography startDecorator={<img src={ASSETS.GUARANTOR_ICON} />} level="title-md">
        {applicantInfo?.fullName}
      </Typography>
      <Flex y fullwidth gap1 pr={1}>
        <Divider />
        <Typography textColor="neutral.400">Basic information</Typography>
        {applicantInfo.phoneNumber && renderTitleAndValue('Phone number', applicantInfo.phoneNumber)}
        {loanRequest && (
          <>
            {renderTitleAndValue('Loan Amount', formatApplicationData({ property: 'amount', value: loanRequest.amount }))}
            {renderTitleAndValue('Loan Period', formatApplicationData({ property: 'term', value: loanRequest.term }))}
            {renderTitleAndValue('Loan Purpose', formatApplicationData({ property: 'purpose', value: loanRequest.purpose }))}
          </>
        )}
        {renderTitleAndValue(
          'Residency Status',
          formatApplicationData({
            property: 'residencyStatus',
            value: applicantInfo?.residencyStatus
          })
        )}
        {renderTitleAndValue(
          'DOB',
          formatApplicationData({
            property: 'dateOfBirth',
            value: format(applicantInfo.dateOfBirth!, 'dd/MM/yyyy')
          })
        )}
        {renderTitleAndValue(
          'Monthly Income',
          formatApplicationData({
            property: 'monthlyIncome',
            value: applicantInfo.monthlyIncome
          })
        )}

        <Divider />
        <Typography textColor="neutral.400">Employment Period</Typography>

        {renderTitleAndValue(
          'Job Title',
          formatApplicationData({
            property: 'employmentType',
            value: applicantInfo.employmentType
          })
        )}
        <Divider />
        {documents && (
          <>
            <Divider />
            <Typography textColor="neutral.400">Documents</Typography>
            {Object.keys(DocumentTypeEnum).map((docType) => {
              const file = applicantInfo.documents?.find((doc) => doc.documentType === docType);
              return (
                <Flex key={docType} gap1 x xsb yc height="25px">
                  <Typography>{docType}</Typography>
                  {file ? <ViewDocumentBtn filename={file.filename} /> : 'Missing'}
                </Flex>
              );
            })}
          </>
        )}
      </Flex>
      {onDelete && (
        <Button
          variant="soft"
          color="neutral"
          size="lg"
          fullWidth
          startDecorator={<img src={ASSETS.REMOVE} />}
          loading={isLoading}
          onClick={() => onDelete()}
          sx={{ mt: 2 }}
        >
          Remove
        </Button>
      )}
    </RsModal>
  );
};
