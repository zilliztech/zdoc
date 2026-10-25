---
title: "DescribeRole() | Cloud"
slug: /cpp/cpp/Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作提供指定角色的详细信息。 | Cloud"
type: docx
token: U8KCdu2BRohC5CxZK7vch6TGnrc
sidebar_position: 6
keywords: 
  - AI 幻觉
  - AI 智能体
  - 语义搜索
  - 异常检测
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeRole()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DescribeRole()

此操作提供指定角色的详细信息。

```c++
Status DescribeRole(const DescribeRoleRequest& request, DescribeRoleResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
```

**请求方法：**

- `WithRoleName(const std::string& name)`

    设置要描述的角色名称。

- `WithDatabaseName(const std::string& db_name)`

    设置角色作用范围内的 Database 名称。可选。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

- **response** (*DescribeRoleResponse*) -

    - **Desc** (*const RoleDesc&*) -

        获取角色描述。

        - **Name** (*const std::string&*) -

            获取角色名称。

        - **Description** (*const std::string&*) -

            获取角色描述。

        - **GrantItems** (*const std::vector&lt;GrantItem&gt;&*) -

            获取角色的权限项。

            - **object_type_** (*std::string*) -

                权限类型。

            - **object_name_** (*std::string*) -

                权限名称。

            - **db_name_** (*std::string*) -

                该权限生效所在的 Database。

            - **role_name_** (*std::string*) -

                将权限授予哪个角色。

            - **privilege_** (*std::string*) -

                权限。

            - **grantor_name_** (*std::string*) -

                授权者名称。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

连接 MilvusClientV2 后，描述名为 &lt;role_name&gt; 的角色。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
status = client->DescribeRole(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
