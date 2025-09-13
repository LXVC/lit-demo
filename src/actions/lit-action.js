const stringToUint8Array = (str) => new TextEncoder().encode(str);
const uint8ArrayToString = (array) => new TextDecoder().decode(array);

const encryptAndStore = async (data, accessControlConditions) => {
  try {
    const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
      accessControlConditions: accessControlConditions,
      data: stringToUint8Array(data),
    });

    const irysUploadUrl = "https://node2.irys.xyz/tx";
    const base64Ciphertext = Lit.Actions.uint8ArrayToString(ciphertext, 'base64');

    const uploadResponse = await fetch(irysUploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: base64Ciphertext
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Irys: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    const irysTxId = uploadResult.id;

    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        irysTxId: irysTxId,
        accessControlConditions: accessControlConditions,
        dataToEncryptHash: dataToEncryptHash,
      })
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        error: error.message
      })
    });
  }
};

const decryptAndRetrieve = async (irysTxId, accessControlConditions, dataToEncryptHash) => {
  try {
    const irysGatewayUrl = `https://node2.irys.xyz/${irysTxId}`;
    const dataResponse = await fetch(irysGatewayUrl);

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch data from Irys: ${dataResponse.statusText}`);
    }

    const base64Ciphertext = await dataResponse.text();
    const ciphertext = Lit.Actions.stringToUint8Array(base64Ciphertext, 'base64');

    const { decryptedData } = await Lit.Actions.decrypt({
      accessControlConditions: accessControlConditions,
      ciphertext: ciphertext,
      dataToEncryptHash: dataToEncryptHash,
    });

    const decryptedString = uint8ArrayToString(decryptedData);
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        decryptedData: decryptedString
      })
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        error: error.message
      })
    });
  }
};

const main = async () => {
  const params = Lit.Actions.request.params;

  if (!params || !params.operation) {
    Lit.Actions.setResponse({
      response: JSON.stringify({ 
        success: false, 
        error: "Invalid parameters. 'operation' field is required." 
      })
    });
    return;
  }

  const operation = params.operation;

  if (operation === 'store') {
    const data = params.data;
    const accessControlConditions = params.accessControlConditions;

    if (!data || !accessControlConditions) {
      Lit.Actions.setResponse({
        response: JSON.stringify({ 
          success: false, 
          error: "Missing required parameters for 'store' operation. 'data' and 'accessControlConditions' are required." 
        })
      });
      return;
    }

    await encryptAndStore(data, accessControlConditions);
  } else if (operation === 'retrieve') {
    const irysTxId = params.irysTxId;
    const accessControlConditions = params.accessControlConditions;
    const dataToEncryptHash = params.dataToEncryptHash;

    if (!irysTxId || !accessControlConditions || !dataToEncryptHash) {
      Lit.Actions.setResponse({
        response: JSON.stringify({ 
          success: false, 
          error: "Missing required parameters for 'retrieve' operation. 'irysTxId', 'accessControlConditions', and 'dataToEncryptHash' are required." 
        })
      });
      return;
    }

    await decryptAndRetrieve(irysTxId, accessControlConditions, dataToEncryptHash);
  } else {
    Lit.Actions.setResponse({
      response: JSON.stringify({ 
        success: false, 
        error: "Invalid operation. Use 'store' or 'retrieve'." 
      })
    });
  }
};

try {
  main();
} catch (error) {
  Lit.Actions.setResponse({
    response: JSON.stringify({ 
      success: false, 
      error: `Unhandled error in main: ${error.message}` 
    })
  });
}