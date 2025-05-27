import ArrowRightIcon from "./arrowRightIcon";
import CalendarTickIcon from "./calendarTickIcon";
import CopyIcon from "./copyIcon";
import FlashIcon from "./flashIcon";
import NoteIcon from "./noteIcon";
import SearchIcon from "./searchIcon";
import SingPassVerifiedIcon from "./singpassVerifiedIcon";

export const Icons = {
  ArrowRight: ArrowRightIcon,
  CalendarTick: CalendarTickIcon,
  Copy: CopyIcon,
  Flash: FlashIcon,
  Note: NoteIcon,
  Search: SearchIcon,
  SingPassVerified: SingPassVerifiedIcon,
};

export type IconType = keyof typeof Icons;
