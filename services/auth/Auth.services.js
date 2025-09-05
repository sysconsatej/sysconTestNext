const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const baseUrlSQl = process.env.NEXT_PUBLIC_BASE_URL_SQL;
import { decrypt, encrypt } from "@/helper/security";
import Cookies from "js-cookie";

export function getLocationAndLogin(data, rememberMe) {
  const fetchUserData = async (position, resolve, reject) => {
    const latitude = position?.coords?.latitude;
    const longitude = position?.coords?.longitude;

    data.latitude = latitude;
    data.longitude = longitude;
    data.rememberMe = rememberMe;

    try {
      const response = await fetch(`${baseUrlSQl}/api/userControl/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response["success"]) {
        const responseData = response.data[0];
        const themeData = responseData.theme;

        if (response["success"] === true) {
          localStorage.setItem("token", JSON.stringify(response["token"]));
          Cookies.set("token", response["token"], {
            expires: rememberMe ? 7 : undefined,
          });
        }

        localStorage.setItem(
          "userData",
          encrypt(JSON.stringify(response["data"]))
        );
        localStorage.setItem("darkMode", "false");
        if (rememberMe) {
          localStorage.setItem(
            "loginCredentials",
            encrypt(JSON.stringify(data))
          );
        } else {
          localStorage.removeItem("loginCredentials");
        }
        sessionStorage.setItem("companyId", responseData.defaultCompanyId);
        sessionStorage.setItem("branchId", responseData.defaultBranchId);
        sessionStorage.setItem("financialYear", responseData.defaultFinYearId);

        const serverThemeData = {
          lightTheme: themeData,
          darkTheme: {
            ...themeData,
            pageBackground: "#000000",
            commonBg: "#1f1f1f",
            commonTextColor: "#ffffff",
            navbarBg: "#181818",
            navbarTextColor: "#FFFFFF",
            sidebarBg: "#181818",
            sidebarTextColor: "white",
            sidebarBgHover: "white",
            sidebarTextColorHover: "#181818",
            tableRowBg: "#1f1f1f",
            tableRowTextColor: "white",
            tableRowBgHover: "white",
            tableRowTextColorHover: "#1f1f1f",
            accordionBodyBg: "#1f1f1f",
            inputBg: "#1f1f1f",
            inputLabelTextColor: "white",
            inputTextColor: "white",
            inputBorderColor: "white",
          },
        };

        localStorage.setItem(
          "ThemeData",
          encrypt(JSON.stringify(serverThemeData))
        );

        resolve({
          result: response["success"],
          token: response["token"],
          emailId: responseData["emailId"],
        });
      } else {
        console.error("Login API error:", response['error']);
        resolve({
          result: response["message"],
        });
      }
    } catch (error) {
      console.error("Login API error:", error);
      reject("Failed to login");
    }
  };

  return new Promise((resolve, reject) => {
    const successCallback = async (position) => {
      await fetchUserData(position, resolve, reject);
    };

    const errorCallback = (error) => {
      fetchUserData(error, resolve, reject);
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      console.error(
        "Geolocation is not supported by this browser or is not accessible in this context."
      );
      errorCallback(new Error("Geolocation not supported or not accessible"));
    }
  });
}

export async function randomImage() {
  try {
    const response = await fetch(`${baseUrl}/api/image/randomImage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());

    if (response["success"]) {
      return response["data"];
    }
    return response["message"];
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function sideBarMenu(userName) {
  try {
    console.log("userName", userName);

    const token = localStorage.getItem("token");
    const companyId = sessionStorage.getItem("companyId");
    const companyBranchId = sessionStorage.getItem("branchId");
    const loginfinYear = sessionStorage.getItem("financialYear");
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    const response = await fetch(`${baseUrlSQl}/api/menuControl/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify({
        ...userName,
        companyId,
        companyBranchId,
        loginfinYear,
        clientId,
      }),
    }).then((response) => response.json());

    if (response["success"]) {
      return response["data"];
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function randomNews(clientCode) {
  try {
    // Ensure clientCode is defined
    if (!clientCode) {
      throw new Error("clientCode is required");
    }
    const url = `${baseUrl}/api/News/fetchNews`;

    // Perform the fetch operation
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clientCode }),
    });

    // Check if the response was successful
    if (!response.ok) {
      // If not, throw an error with the status text
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Check if the response indicates success
    if (data.success) {
      // If successful, return the data
      return data.data;
    } else {
      // If not successful, return the message from the server
      return data.message;
    }
  } catch (error) {
    // Log the error and return false
    console.error("Error fetching news:", error);
    return false;
  }
}

export async function fetchUserData(data) {
  const url = `${baseUrl}/api/validations/formControlValidation/fetchData`; // Replace with your actual endpoint path
  // Construct the body object with the specified table name and dynamic email
  const requestBody = data;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error(`Server Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("console from auth", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function fetchProjectedData(data) {
  const url = `${baseUrl}/api/validations/formControlValidation/fetchProjectedData`; // Replace with your actual endpoint path
  // Construct the body object with the specified table name and dynamic email
  const requestBody = data;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error(`Server Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("console from auth", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}
export async function sendEmail(emailData) {
  try {
    const response = await fetch(`${baseUrlSQl}/api/send/emailLogin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
}
export async function verifyEmail(email) {
  try {
    const response = await fetch(`${baseUrlSQl}/api/userControl/verifyEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();

    if (data.success) {
      return data;
    } else {
      console.log("Email verification failed:", data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.log("Error verifying email:", error);
    throw error;
  }
}
export async function userLogout(token) {
  try {
    const response = await fetch(`${baseUrlSQl}/api/userControl/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    }).then((res) => res.json());
    return response;
  } catch (error) {
    console.log("logout Error", error);
  }
}
export async function verifyRedisToken(token) {
  try {
    const url = new URL(`${baseUrlSQl}/api/userControl/verifyRedisToken`);
    url.searchParams.append("token", token);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}
export async function fetchJobsData(obj) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/api/Reports/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
      },
      body: JSON.stringify(obj),
    }).then((res) => res.json());
    return response.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}
export async function updateData(data) {
  try {
    const response = await fetch(
      `${baseUrl}/api/validations/formControlValidation/UpdateData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    // Handle response based on success or failure
    if (response.ok) {
      console.log("Response Data:", responseData);
      return responseData;
    } else {
      console.error(
        "Response Error:",
        responseData.error || responseData.message
      );
      // Additional handling for failure
      return null;
    }
  } catch (error) {
    console.error("Error updating data:", error);
    // Handle error
    return null;
  }
}
export async function menuAccessByEmailId(emailId) {
  try {
    const url = new URL(`${baseUrlSQl}/api/userControl/menuAccessByEmailId`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: emailId }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}
export async function fetchNews(clientId) {
  try {
    const url = `${baseUrlSQl}/api/userControl/news`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientId),
    });

    const {data} = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return false;
  }
}
export async function changeDevice(emailId, token) {
  try {
    const url = `${baseUrlSQl}/api/userControl/changeDeviceByRedis`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailId, token }),
    });

    Cookies.set("token", token);
    localStorage.setItem("token", JSON.stringify(token));
    await response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return false;
  }
}
export async function clearPassByRedis(emailId) {
  try {
    const url = `${baseUrlSQl}/api/userControl/clearPassByRedis`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id : Number(emailId) }),
    });
    await response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return false;
  }
}
export async function menuAccessSubmit(menuObj) {
  try {
    const token = localStorage.getItem("token");
    const url = new URL(`${baseUrlSQl}/api/menuControl/menuAccessSubmit`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "x-access-token": JSON.parse(token),
       },
      body: JSON.stringify(menuObj),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}
