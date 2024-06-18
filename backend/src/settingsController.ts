import * as db from "./dbController";


export interface MasterPinCheck {
  statusCode: number,
  message: string
}

// Return start
export function CheckMasterPin(pinParam: any): MasterPinCheck {
  let ret: MasterPinCheck = { statusCode: 200, message: "" }
  const pinToCheck = parseInt(pinParam as string, 10);
  if (isNaN(pinToCheck)) {
    ret = { statusCode: 400, message: 'Missing integer parameter pin' }
  } else {
    const pin = db.GetMasterPin()
    if (pinToCheck != pin) {
      ret = { statusCode: 401, message: 'Wrong Master Pin: ' + pinToCheck }
    }
  }
  return ret
}