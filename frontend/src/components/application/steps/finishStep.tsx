import { Button, FormControl, FormLabel, Link, Typography } from '@mui/material';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { z } from 'zod';
import { useVisitorContext } from '../../../context/visitorContext';
import { ASSETS } from '../../../data/assets';
import WarningIcon from '../../icons/warningIcon';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';

type ValidationValue = {
  value: string;
  isValid?: boolean;
};

const PersonalInfoValidator = {
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{10}$/, 'Phone number must be a valid 10-digit number'),
  email: z
    .string({
      required_error: 'Email is required'
    })
    .nonempty('Email is required')
    .email('Please enter a valid email address')
};

const FinishStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, error } = useVisitorContext();

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

  const [phoneNumber, setPhoneNumber] = useState<ValidationValue>({
    value: ''
  });

  const [email, setEmail] = useState<ValidationValue>({
    value: ''
  });

  useImperativeHandle(ref, () => ({
    getValue: () => ({
      phoneNumber,
      email
    })
  }));

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

        <FormControl error={phoneNumber.isValid === false}>
          <ApplicationStyledInput
            startDecorator={<Typography textColor={'primary.500'}>+86</Typography>}
            placeholder={'Enter your phone number'}
            sx={{ maxWidth: { xs: '100%', sm: 340, md: 340 } }}
            type="number"
            value={phoneNumber.value}
            onChange={(e) => {
              setPhoneNumber({ value: e.target.value });
              setError('');
            }}
            endDecorator={
              phoneNumber.isValid && (
                <Flex xc gap={5 / 8}>
                  <Typography textColor={'primary.500'} textTransform={'uppercase'}>
                    Verified
                  </Typography>

                  <img src={ASSETS.CHECKMARK_FILLED} alt="check-icon" width={22} height={22} />
                </Flex>
              )
            }
          />
        </FormControl>

        {!phoneNumber.isValid && (
          <>
            {error && (
              <Flex x xc gap1>
                <WarningIcon color="danger" />
                <Typography textAlign={'center'} textColor="danger.500">
                  {error}
                </Typography>
              </Flex>
            )}

            <Link
              onClick={() => {
                const validation = PersonalInfoValidator.phoneNumber.safeParse(phoneNumber.value);

                setPhoneNumber(({ value }) => ({
                  value,
                  isValid: validation.success
                }));

                if (validation.success) {
                  setError('');
                } else {
                  console.log(JSON.parse(validation.error.message)?.[0]?.message);
                  setError(JSON.parse(validation.error.message)?.[0]?.message);
                }

                if (email.value || email.isValid === false) {
                  setEmail({ value: '', isValid: undefined });
                }
              }}
            >
              Continue
            </Link>
          </>
        )}
      </Flex>

      {!phoneNumber.isValid && (
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

      {phoneNumber.isValid && (
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

          <FormControl error={email.isValid === false}>
            <FormLabel>Email</FormLabel>
            <ApplicationStyledInput
              placeholder={'Enter your email'}
              type="email"
              onChange={(e) => {
                setEmail({ value: e.target.value });
                setError('');
              }}
              value={email.value}
            />
          </FormControl>

          <>
            {error && (
              <Flex x xc gap1>
                <WarningIcon color="danger" />
                <Typography textAlign={'center'} textColor="danger.500">
                  {error}
                </Typography>
              </Flex>
            )}

            <Button
              variant="solid"
              color="primary"
              size="lg"
              sx={{ maxWidth: 300, width: '100%' }}
              onClick={() => {
                const validation = PersonalInfoValidator.email.safeParse(email.value);

                if (!validation.success) {
                  setError(JSON.parse(validation.error.message)?.[0]?.message);
                }

                setEmail(({ value }) => ({
                  value,
                  isValid: PersonalInfoValidator.email.safeParse(value).success
                }));
              }}
            >
              Launch your Application
            </Button>
          </>

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
});

export default FinishStep;
