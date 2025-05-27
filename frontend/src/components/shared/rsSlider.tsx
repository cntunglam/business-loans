import { Slider, Typography } from "@mui/joy";
import { FC, type ReactElement } from "react";
import { formatToDisplayString } from "../../utils/utils";
import { Flex } from "./flex";

interface Props {
  min: number;
  max: number;
  step: number;
  prefix?: string | ReactElement;
  suffix?: string;
  value: number;
  setValue: (value: number) => void;
  formatNumber?: (value: number) => string;
  showSuffixOnValue?: boolean;
  id?: string;
  "data-testid"?: string;
}

export const RsSlider: FC<Props> = ({
  min,
  max,
  step,
  value,
  setValue,
  prefix,
  suffix,
  formatNumber,
  showSuffixOnValue = true,
  id = "",
  "data-testid": dataTestId,
}) => {
  const formatValue = (val: number) => {
    if (formatNumber) {
      return formatNumber(val);
    }
    return formatToDisplayString(val);
  };

  // Figure out translate x value to always align thumb with below numbers
  const percentage = (value - min) / (max - min);
  const translateX = `${-percentage * 100}%`;

  return (
    <Flex y xc gap={4}>
      <Typography level="h2" textColor="primary.500" fontWeight={"800"} fontSize={46}>
        {prefix === "$" ? <sup style={{ fontSize: 18 }}>$ </sup> : prefix}
        {formatToDisplayString(value)} {showSuffixOnValue && suffix}
      </Typography>
      <Flex x yst gap2 sx={{ width: "100%" }}>
        {/* <IconButton size="lg" onClick={() => setValue(Math.max(value - step, min))}>
          <RemoveCircleOutline />
        </IconButton> */}
        <Flex y fullwidth px={{ xs: 3, sm: 2, md: 0 }}>
          <Slider
            sx={{
              "--Slider-thumbSize": "36px",
              "--Slider-trackSize": "10px",

              "& .MuiSlider-rail": {
                borderRadius: 4,
                backgroundColor: "#d9d9d9",
              },
              "& .MuiSlider-track": {
                borderRadius: 4,
                backgroundColor: "var(--joy-palette-secondary-500)",
              },
              "& .MuiSlider-thumb": {
                // backgroundColor: "var(--joy-palette-secondary-500)",
                transform: `translate(${translateX}, -50%)`,
                border: "4px solid var(--joy-palette-secondary-500)",
                outline: "none !important",
                boxShadow: "0px 2px 10px rgba(159, 128, 186, 0.3)",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0px 2px 10px rgba(159, 128, 186, 0.3)",
                },
                "&.Mui-active": {
                  boxShadow: "0px 2px 10px rgba(159, 128, 186, 0.3)",
                },

                "&:before": {
                  borderColor: "transparent",
                },
              },
            }}
            value={value}
            onChange={(_, v) => setValue(v as number)}
            min={min}
            max={max}
            step={step}
            id={id}
            slotProps={{
              input: {
                "data-testid": `${dataTestId}_input`,
              },
            }}
            data-testid={dataTestId}
          />
          <Flex x xsb yc>
            <Typography textColor="#a0a0a0" fontWeight={"800"}>
              {prefix}
              {formatValue(min)} {suffix}
            </Typography>
            <Typography textColor="#a0a0a0" fontWeight={"800"}>
              {prefix}
              {formatValue(max)} {suffix}
            </Typography>
          </Flex>
        </Flex>
        {/* <IconButton size="lg" onClick={() => setValue(Math.min(value + step, max))}>
          <AddCircleOutline />
        </IconButton> */}
      </Flex>
    </Flex>
  );
};
