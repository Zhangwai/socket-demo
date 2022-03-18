export function fileParse(file: any, type = "base64"): Promise<any> {
  return new Promise((resolve, reject) => {
    const fileRead = new FileReader();
    switch (type) {
      case "base64":
        fileRead.readAsDataURL(file);
        break;
      case "buffer":
        fileRead.readAsArrayBuffer(file);
        break;
      default:
        throw new Error("Wrong");
        break;
    }
    fileRead.onload = (ev) => {
      resolve(ev);
    };
  });
}
