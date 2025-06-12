import { Box, Button, Divider, Typography } from '@mui/material';
import { getAgeFromDateOfBirth } from '@roshi/backend/utils/age';
import { useTranslation } from 'react-i18next';
import { useDeleteMyLoanRequest, useGetMyLoanRequest } from '../api/useLoanRequestApi';
import { formatApplicationData } from '../components/shared/applicationDataFormatter';
import { Flex } from '../components/shared/flex';
import { OpenDialog } from '../context/DialogContainer';
import { ASSETS } from '../data/assets';
import useMediaQueries from '../hooks/useMediaQueries';

export const ApplicationDetailsView = () => {
  const { data: application, isLoading } = useGetMyLoanRequest();
  const deleteApplication = useDeleteMyLoanRequest();
  const queryMedia = useMediaQueries(['md']);
  const { t } = useTranslation();

  const handleDeleteApplication = () => {
    OpenDialog({
      image: ASSETS.UPDATE_DOC_ICON,
      submit: () => {
        deleteApplication.mutateAsync().then(() => window.location.reload());
      },
      type: 'delete',
      title: t('form:applicationdetails.title'),
      body: t('form:applicationdetails.description')
    });
  };

  const renderTitleAndValue = (title: string, value: string) => {
    return (
      <Flex y>
        <Typography>{title}</Typography> <Typography fontWeight={600}>{value}</Typography>
      </Flex>
    );
  };

  if (!application) return '';
  const applicantInfo = application!.applicantInfo;
  const loanRequest = application;

  return (
    <Box px={{ xs: 1, md: 3 }} pt={3} pb={8}>
      <Box mb={2}>
        <Typography level="h4" fontWeight={'700'} color="secondary">
          {t('form:applicationdetails.review')}
        </Typography>
      </Box>

      <Typography startDecorator={<img src={ASSETS.GUARANTOR_ICON} />} level="title-md">
        {applicantInfo?.fullName}
      </Typography>

      <Box sx={{ my: 2 }}>
        <Typography textColor="neutral.400">{t('form:applicationdetails.information')}</Typography>
      </Box>

      <Flex y fullwidth gap2>
        <Flex x fullwidth pr={1} wrap rowGap={2} cols={queryMedia.md ? 3 : 2}>
          {applicantInfo!.phoneNumber && renderTitleAndValue(t('form:applicationdetails.phone-number'), applicantInfo!.phoneNumber)}
          {loanRequest && (
            <>
              {renderTitleAndValue(
                t('form:applicationdetails.amount'),
                formatApplicationData({ property: 'amount', value: loanRequest.amount })
              )}
              {renderTitleAndValue(
                t('form:applicationdetails.period'),
                formatApplicationData({ property: 'term', value: loanRequest.term })
              )}
              {renderTitleAndValue(
                t('form:applicationdetails.purpose'),
                formatApplicationData({ property: 'purpose', value: loanRequest.purpose })
              )}
            </>
          )}
          {renderTitleAndValue(
            t('form:applicationdetails.residency'),
            formatApplicationData({
              property: 'residencyStatus',
              value: applicantInfo?.residencyStatus
            })
          )}
          {renderTitleAndValue(
            t('form:applicationdetails.age'),
            formatApplicationData({
              property: 'dateOfBirth',
              value: getAgeFromDateOfBirth(applicantInfo!.dateOfBirth)
            })
          )}
        </Flex>
        <Flex x fullwidth pr={1} cols={queryMedia.md ? 3 : 2}>
          {renderTitleAndValue(
            t('form:applicationdetails.monthly'),
            formatApplicationData({
              property: 'monthlyIncome',
              value: applicantInfo!.monthlyIncome
            })
          )}
        </Flex>
      </Flex>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ my: 2 }} textColor="neutral.400">
        {t('form:applicationdetails.employment')}
      </Typography>

      <Flex x fullwidth gap1 pr={1} cols={2}>
        {renderTitleAndValue(
          t('form:applicationdetails.job'),
          formatApplicationData({
            property: 'employmentType',
            value: applicantInfo!.employmentType
          })
        )}
      </Flex>

      <Button
        variant="soft"
        color="neutral"
        size="lg"
        fullWidth
        startDecorator={<img src={ASSETS.REMOVE} />}
        loading={isLoading}
        onClick={() => handleDeleteApplication()}
        sx={{ mt: 2 }}
      >
        {t('form:applicationdetails.remove')}
      </Button>
    </Box>
  );
};
