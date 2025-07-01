import requests
import json

Instance_Id = "02108a22-911a-45de-bbae-186e4331a8b8"


def get_huawei_token():
    """
    获取华为云用户Token
    :return: token字符串
    """
    url = "https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens"

    # payload = "{\"auth\":{\"identity\":{\"methods\":[\"password\"],\"password\":{\"user\":{\"domain\":{\"name\":\"thecalmman\"},\"name\":\"LSR\",\"password\":\"QianSaiAPP\"}}}}}"
    payload_dict = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "domain": {
                            "name": "thecalmman"
                        },
                        "name": "L610",
                        "password": "QianSaiAPP"
                    }
                }
            },
            "scope": {
                "domain": {
                    "name": "thecalmman"
                }
            }
        }
    }

    payload = json.dumps(payload_dict)

    headers = {
        'Content-Type': 'application/json;charset=utf8'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    # 从响应头中获取用户Token
    token = response.headers['X-Subject-Token']
    # print(token)
    # print("\n\n\n")
    return token


def get_device(token, project_id, device_id):
    """
    获取设备信息
    :param token: 用户Token
    :return: 设备信息响应
    """
    # url = f"https://iotda.cn-north-4.myhuaweicloud.com/v5/iot/{project_id}/devices/{device_id}"
    url = f"https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot/{project_id}/devices/{device_id}"
    headers = {
        "X-Auth-Token": f"{token}",
        "Instance-Id": f"{Instance_Id}"
    }

    response = requests.request("GET", url, headers=headers, data="")
    # print(response)
    return response.text


def get_device_shadow(token, project_id, device_id):
    """
    查询设备影子
    :param token: 用户Token
    :param project_id: 项目ID
    :param device_id: 设备ID
    :return: 设备影子信息
    """
    # url = f"https://iotda.cn-north-4.myhuaweicloud.com/v5/iot/{project_id}/devices/{device_id}/shadow"
    url = f"https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot/{project_id}/devices/{device_id}/shadow"

    headers = {
        'X-Auth-Token': f"{token}",
        "Instance-Id": f"{Instance_Id}"
    }

    response = requests.request("GET", url, headers=headers, data="")
    return response.text


def send_device_message(token, project_id, device_id, message):
    """
    下发设备消息
    :param token: 用户Token
    :param project_id: 项目ID 
    :param device_id: 设备ID
    :param message: 消息内容
    :return: 响应结果
    """
    # url = f"https://iotda.cn-north-4.myhuaweicloud.com/v5/iot/{project_id}/devices/{device_id}/messages"
    url = f"https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot/{project_id}/devices/{device_id}/messages"

    headers = {
        "X-Auth-Token": f"{token}",
        "Instance-Id": f"{Instance_Id}",
        "Content-Type": "application/json"
    }

    payload = json.dumps({
        "message": message
    })

    response = requests.request("POST", url, headers=headers, data=payload)
    return response.text


if __name__ == "__main__":
    token = get_huawei_token()

    # 设备信息
    project_id = "1d2b74f87e5c495d9dfb67a7ad8bcab2"
    device_id = "681cce3d9314d1185119d0be_DataTransfer"
    device_info_mq = get_device(token, project_id, device_id)
    print("设备信息mqtt:", device_info_mq)

    # 设备影子
    device_ywnd1_shadow = get_device_shadow(token, project_id, device_id)
    print("设备影子:", device_ywnd1_shadow)

    # 下发设备消息
    message = "abc"
    device_message = send_device_message(token, project_id, device_id, message)
    print("设备消息:", device_message)
