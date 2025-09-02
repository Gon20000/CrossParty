import { styleText } from "node:util";

export const errorMark = styleText(["bold", "bgRed"], "Error");
export const errorMark2 = styleText(["bold", "bgRedBright"], "Error");
export const serverMark = styleText(["bold", "bgGray"], "Server");
export const xMark = styleText(["bold", "redBright"], " X ");
export const oMark = styleText(["bold", "blueBright"], " O ");
export const xMark2 = styleText(["bold", "bgRedBright", "whiteBright"], " X ");
export const oMark2 = styleText(["bold", "bgBlueBright", "whiteBright"], " O ");

// sub-zero
const bannerText = String.raw` ______     ______     ______     ______     ______     ______   ______     ______     ______   __  __    
/\  ___\   /\  == \   /\  __ \   /\  ___\   /\  ___\   /\  == \ /\  __ \   /\  == \   /\__  _\ /\ \_\ \   
\ \ \____  \ \  __<   \ \ \/\ \  \ \___  \  \ \___  \  \ \  _-/ \ \  __ \  \ \  __<   \/_/\ \/ \ \____ \  
 \ \_____\  \ \_\ \_\  \ \_____\  \/\_____\  \/\_____\  \ \_\    \ \_\ \_\  \ \_\ \_\    \ \_\  \/\_____\ 
  \/_____/   \/_/ /_/   \/_____/   \/_____/   \/_____/   \/_/     \/_/\/_/   \/_/ /_/     \/_/   \/_____/ 
`;
export const banner = styleText("cyanBright", bannerText);

