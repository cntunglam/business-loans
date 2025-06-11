import { Button, FormControl, FormHelperText, FormLabel, Link, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { ASSETS } from '../../../data/assets';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';

type VerifiedValue = {
  value: string;
  isVerified?: boolean;
};

const FinishStep: React.FC = () => {
  const tips = useMemo(
    () => [
      {
        key: crypto.randomUUID(),
        text: 'Access better rates & more features'
      },
      {
        key: crypto.randomUUID(),
        text: 'Quick loan decisions (97% approval rate)'
      },
      {
        key: crypto.randomUUID(),
        text: 'Real-time application updates via chat & mail'
      }
    ],
    []
  );

  const [phoneNumber, setPhoneNumber] = useState<VerifiedValue>({
    value: ''
  });

  const [email, setEmail] = useState<VerifiedValue>({
    value: ''
  });

  return (
    <Flex y gap={5}>
      <Flex
        sx={{
          key: '',
          alignItems: 'center',
          textWrap: 'wrap'
        }}
        y
        gap={2.5}
      >
        <Typography
          fontWeight={800}
          textColor={'secondary.500'}
          level="title-lg"
          fontSize={{ xs: '1.75rem', md: '2.125rem' }}
          textAlign="center"
          width={'100%'}
        >
          {'Protecting your information'}
        </Typography>

        <FormControl error={phoneNumber.isVerified === false}>
          <ApplicationStyledInput
            startDecorator={<Typography textColor={'primary.500'}>+86</Typography>}
            placeholder={'Enter your phone number'}
            sx={{ maxWidth: { xs: '100%', sm: 340, md: 340 } }}
            type="number"
            value={phoneNumber.value}
            onChange={(e) => setPhoneNumber({ value: e.target.value })}
            endDecorator={
              phoneNumber.isVerified && (
                <Flex xc gap={5 / 8}>
                  <Typography textColor={'primary.500'} textTransform={'uppercase'}>
                    Verified
                  </Typography>

                  <img src={ASSETS.CHECKMARK_FILLED} alt="check-icon" width={22} height={22} />
                </Flex>
              )
            }
          />

          <FormHelperText>{phoneNumber.isVerified === false && 'Please enter a valid phone number.'}</FormHelperText>
        </FormControl>

        {!phoneNumber.isVerified && (
          <Link
            onClick={() => {
              setPhoneNumber(({ value }) => ({
                value,
                isVerified: !!value
              }));

              if (email.value || email.isVerified === false) {
                setEmail({ value: '', isVerified: undefined });
              }
            }}
          >
            Continue
          </Link>
        )}
      </Flex>

      {!phoneNumber.isVerified && (
        <Flex gap={7.5} xc maxWidth={673}>
          <img
            src={ASSETS.FINAL_STEP}
            alt="final-step"
            style={{
              flex: 'none'
            }}
            width={266}
            height={278}
          />

          <Flex y gap={2.5}>
            <Typography textColor={'secondary.500'}>{'Borrowers use ROSHI to compare rates, apply online & settle faster.'}</Typography>

            {tips.map((tip) => (
              <Flex key={tip.key} xc gap={1.25}>
                <img src={ASSETS.CHECKMARK} alt="check-icon" width={24} height={24} />

                <Typography textColor={'secondary.500'}>{tip.text}</Typography>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}

      {phoneNumber.isVerified && (
        <Flex gap={2.5} y xc maxWidth={400}>
          <div>
            <Typography
              fontWeight={800}
              textColor={'secondary.500'}
              level="title-md"
              fontSize={'1.5rem'}
              textAlign="center"
              lineHeight={'29px'}
              mb={0.5}
            >
              {'Almost there...'}
            </Typography>

            <Typography textAlign={'center'} textColor={'text.tertiary'}>
              {'Add email to launch application'}
            </Typography>
          </div>

          <FormControl error={email.isVerified === false}>
            <FormLabel>Email</FormLabel>
            <ApplicationStyledInput
              placeholder={'Enter your email'}
              type="email"
              onChange={(e) => setEmail({ value: e.target.value })}
              value={email.value}
            />
            <FormHelperText>{email.isVerified === false && 'Please enter a valid email address.'}</FormHelperText>
          </FormControl>

          <Button
            variant="solid"
            color="primary"
            size="lg"
            sx={{ maxWidth: 300, width: '100%' }}
            onClick={() =>
              setEmail(({ value }) => ({
                value,
                isVerified: !!value
              }))
            }
          >
            Launch your Application
          </Button>

          <Flex y xc>
            <Typography textAlign={'center'} textColor={'text.tertiary'} mb={1.25}>
              {'Or sign in with'}
            </Typography>

            <Flex gap={2.5} xc>
              <Flex sx={{ cursor: 'pointer' }}>
                <img src={ASSETS.FACEBOOK_COLOR_CIRCLE} alt="facebook-icon" width={24} height={24} />
              </Flex>

              <Flex sx={{ cursor: 'pointer' }}>
                <img src={ASSETS.GOOGLE_COLOR_CIRCLE} alt="google-icon" width={24} height={24} />
              </Flex>
            </Flex>
          </Flex>

          <Typography textAlign={'center'} textColor={'text.tertiary'} sx={{ maxWidth: 281, width: '100%' }}>
            By registering, you agree to ROSHI's{' '}
            <Link color="link" component={'span'}>
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link color="link" component={'span'}>
              Terms & Conditions
            </Link>
            .
          </Typography>
        </Flex>
      )}
    </Flex>
  );
};

export default FinishStep;
