---
title: "API 密钥 | Cloud"
slug: /manage-api-keys
sidebar_key: manage-api-keys
sidebar_label: "API 密钥"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在用户或应用程序调用 API 或 SDK 访问 Zilliz Cloud 控制面和数据面资源时，需要使用API 密钥进行身份认证。API 密钥是一个由字母和数字组成的字符串。每个密钥有自己的属性，如名称和 ID。 | Cloud"
type: origin
token: UGzNwB4TmiqTozkJvarceRdenif
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - api 密钥

---

import Admonition from '@theme/Admonition';


# API 密钥

在用户或应用程序调用 API 或 SDK 访问 Zilliz Cloud 控制面和数据面资源时，需要使用API 密钥进行身份认证。API 密钥是一个由字母和数字组成的字符串。每个密钥有自己的属性，如名称和 ID。

## API 密钥概述\{#overview-of-api-keys}

为应对不同需求场景，Zilliz Cloud 提供了两种主要的 API 密钥类型：

- **个人 API 密钥**：每个用户注册 Zilliz Cloud 账号时会自动生成一个相关联的个人密钥。该密钥继承对应用户在所属组织和项目中的角色权限。如果账号用户离开组织，其关联的个人密钥将被自动删除。作为[组织管理员](./organization-users)或[项目管理员](./project-users)，您可以在 Zilliz Cloud 控制台上看到两种类型的个人 API 密钥：

    - **您的个人 API 密钥**：专属于您的个人密钥。您可以查看并复制此 API 密钥。

    - **组员的个人 API 密钥**：组织或项目中其他成员所拥有的个人密钥列表。您只能查看这些密钥的名称和 ID，无法复制或查看密钥本身。

- **自定义密钥**：由**组织管理员**和**项目管理员**手动创建，供应用程序或没有注册 Zilliz Cloud 账号的外部用户使用。自定义密钥适用于需要长期访问 Zilliz Cloud 资源的场景，确保即使 API 密钥的创建人离开组织，应用和外部用户也可以不间断地访问 Zilliz Cloud 资源。

<Admonition type="info" icon="📘" title="说明">

请避免将个人 API 密钥用于生产环境。生产环境中推荐使用自定义密钥。个人 API 密钥将随着用户账号删除同步失效。

</Admonition>

以下图表展示了 API 密钥的角色和资源访问权限。

![YElywNKSghmTLabpy7ice4vdnFe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/YElywNKSghmTLabpy7ice4vdnFe.png)

下表展示了不同角色的用户所具备的 API 密钥权限范围。更多有关角色和权限信息，请参考[访问控制](./access-control)。

<table>
   <tr>
     <th colspan="2"><p><strong>API 密钥角色</strong></p></th>
     <th><p><strong>权限范围</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>组织管理员</p></td>
     <td><p>具备组织内所有资源（包括组织内所有项目、集群和 Volume）的管理员权限。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>组织账单管理员</p></td>
     <td><p>仅具备组织账单的管理员权限。无权限访问组织内的项目、集群和 Volume。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>组织成员</p></td>
     <td><p>项目管理员</p></td>
     <td><p>默认情况下，具备指定项目和项目下所有集群和 Volume的管理员权限。</p></td>
   </tr>
   <tr>
     <td><p>项目编辑者（Read-Write）</p></td>
     <td><p>默认情况下，具备指定项目和项目下所有集群和 Volume的读写权限。</p></td>
   </tr>
   <tr>
     <td><p>项目查看者（Read-Only）</p></td>
     <td><p>默认情况下，具备指定项目和项目下所有集群和 Volume的只读权限。</p></td>
   </tr>
</table>

## 使用限制\{#limits-and-restrictions}

- 每个组织中可创建最多 100 个自定义 API 密钥。

- API 密钥的管理权限由用户的组织和项目角色决定。具体权限如下：

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p>组织管理员</p></th>
         <th rowspan="2"><p>组织账单管理员</p></th>
         <th colspan="3"><p>组织成员</p></th>
       </tr>
       <tr>
         <td><p><strong>项目管理员</strong></p></td>
         <td><p><strong>项目编辑者（Read-Write）</strong></p></td>
         <td><p><strong>项目查看者（Read-Only）</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>您的个人 API 密钥</strong></p></td>
       </tr>
       <tr>
         <td><p>创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
       </tr>
       <tr>
         <td><p>查看并复制</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️ </p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>编辑</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>重置</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>组员的个人 API 密钥</strong></p></td>
       </tr>
       <tr>
         <td><p>创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
         <td><p>系统自动创建</p></td>
       </tr>
       <tr>
         <td><p>查看名称和 ID</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>复制</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>编辑</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>重置</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
         <td><p>在用户离开组织时由系统自动删除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>自定义 API 密钥</strong></p></td>
       </tr>
       <tr>
         <td><p>创建</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>查看并复制</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>编辑</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>重置</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>删除</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## 创建 API 密钥\{#create-an-api-key}

在 Zilliz Cloud 中，除了系统为每位组织用户自动生成的个人密钥外，您还可以手动创建自定义密钥。仅**组织管理员**和**项目管理员**有权限创建自定义 API 密钥。

1. 前往组织 **API 密钥**页面。点击 **+ API 密钥**。

    ![create-api-key-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/create-api-key-cn.png "create-api-key-cn")

1. 输入 **API 密钥名称**并设置 **API 密钥权限**。

    ![EqLZbydEpoa9U1xoS8Wc3YZrncg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/EqLZbydEpoa9U1xoS8Wc3YZrncg.png "EqLZbydEpoa9U1xoS8Wc3YZrncg")

    - **API 密钥名称**： 名称长度不可超过 64 个字符。

    - **API 密钥权限**：您可以通过指定用户角色或特定项目，来定义自定义 API 密钥的访问范围。为实现更精细化的访问控制，您还可以通过**将访问权限限制到指定集群和 Volume** 来限制密钥可访问的集群和 Volume 范围。

        <Admonition type="info" icon="📘" title="说明">

        [项目管理员](./project-users)授予自定义 API 密钥的权限受到其自身权限范围的限制。

        </Admonition>

## 查看 API 密钥\{#view-api-keys}

前往组织 **API 密钥**页面。根据您的[角色](./manage-api-keys#limits-and-restrictions)，您所看到的页面内容会所有不同。

- 如果您是**组织管理员**，您可以查看自己的个人 API 密钥、所有组员的个人 API 密钥和所有自定义 API 密钥。

- 如果您是**项目管理员**，您可以查看自己的个人 API 密钥以及您权限范围内的组员个人密钥和自定义密钥。例如，如果用户1仅是项目A的项目管理员，而密钥1拥有项目A、B和C的管理员权限，那么由于其访问范围超出了用户1的权限，密钥1对用户1不可见。

- 如果您是**组织账单管理员**、**项目编辑者（Read-Write）**或**项目查看者（Read-Only）**，您只能查看您自己的个人 API 密钥。

下图展示了组织管理员所能看到的界面内容。

![ZU7ibC75zoqlp3xBXXrckXbvnyK](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ZU7ibC75zoqlp3xBXXrckXbvnyK.png "ZU7ibC75zoqlp3xBXXrckXbvnyK")

## 编辑 API 密钥\{#edit-an-api-key}

目前，您只能编辑自定义 API 密钥。个人 API 密钥无法编辑，因为它们与账户用户绑定。如需修改个人密钥的权限，请先调整用户的组织和项目角色。个人 API 密钥的权限将根据用户的新角色自动调整。

以下说明介绍了如何编辑自定义 API 密钥。

1. 前往组织 **API 密钥**页面。点击目标自定义 API 密钥右侧**操作**栏中的 **...**，点击**编辑**。

    ![edit-api-key-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/edit-api-key-cn.png "edit-api-key-cn")

1. 编辑 **API 密钥名称**和 **API 密钥权限**。

    ![UWJXbPKX3o8GRwxNQarcONMLnVc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/UWJXbPKX3o8GRwxNQarcONMLnVc.png "UWJXbPKX3o8GRwxNQarcONMLnVc")

    - **API 密钥名称**： 名称长度不可超过 64 个字符。

    - **API 密钥权限**：您可以通过指定用户角色或特定项目，来定义自定义 API 密钥的访问范围。为实现更精细化的访问控制，您还可以通过将访问权限限制到指定集群和 Volume 来限制密钥可访问的集群和 Volume 范围。

        <Admonition type="info" icon="📘" title="说明">

        [项目管理员](./project-users)授予自定义 API 密钥的权限受到其自身权限范围的限制。

        </Admonition>

## 重置 API 密钥\{#reset-an-api-key}

如果您的个人 API 密钥或自定义 API 密钥不慎被泄露，请立即重置密钥。

<Admonition type="caution" icon="🚧" title="警告">

重置后，当前的 API 密钥将会失效。任何使用当前密钥的应用程序代码将停止运行，请务必及时更新代码中的 API 密钥信息。

</Admonition>

根据密钥的类型，操作流程有所不同：

- **重置个人 API 密钥**：不论您是什么组织或项目角色，都可以重置您自己的个人 API 密钥。

    ![reset-personal-api-keys-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/reset-personal-api-keys-cn.png "reset-personal-api-keys-cn")

- **重置自定义 API 密钥**：仅**组织管理员**和**项目管理员**有权限重置自定义 API 密钥。

    ![reset-customized-api-keys-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/reset-customized-api-keys-cn.png "reset-customized-api-keys-cn")

## 删除 API 密钥\{#delete-an-api-key}

我们建议您及时删除不再使用的自定义 API 密钥。仅**组织管理员**和**项目管理员**有权限删除自定义 API 密钥。

个人 API 密钥无法手动删除。但是，当 Zilliz Cloud 账号用户离开组织时，其关联的个人 API 密钥将被删除。

下图展示了如何删除自定义 API 密钥。

<Admonition type="caution" icon="🚧" title="警告">

该操作不可撤销。删除后， 任何使用该 API 密钥的应用将无法再访问 Zilliz Cloud 资源。

</Admonition>

![delete-customized-api-keys-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/delete-customized-api-keys-cn.png "delete-customized-api-keys-cn")

## 常见问题\{#faq}

**可以在生产环境中使用个人 API 密钥吗？**

请避免将个人 API 密钥用于生产环境。个人 API 密钥与用户账号绑定，当用户离开组织时会被自动删除。一旦密钥所有者的账号被移除，依赖该密钥的所有应用和服务将立即失去对 Zilliz Cloud 资源的访问权限。

生产环境中请使用自定义 API 密钥。自定义密钥不绑定任何个人账号，即使团队成员离开组织，服务也不会受到影响。                 