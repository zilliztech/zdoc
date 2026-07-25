---
title: "邮箱账号 | BYOC"
slug: /email-accounts
sidebar_label: "邮箱账号"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 注册账户后，您可对账户信息进行管理。您可以编辑账号设置以及删除账号。 | BYOC"
type: origin
token: SVnkw5IkNiOfALkijr1cw91vn3L
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 邮箱
  - 账号

---

import Admonition from '@theme/Admonition';


# 邮箱账号

在 Zilliz Cloud 注册账户后，您可对账户信息进行管理。您可以编辑账号设置以及删除账号。

## 编辑账号个人信息\{#modify-your-account-information}

1. 点击界面右上角人像图标，并选择**账号设置**。

1. 您可以编辑以下个人信息：

    - 姓名

    - 公司

![edit-account-settings](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/edit-account-settings.png "edit-account-settings")

## 修改账号邮箱地址\{#update-account-email-address}

![update_email_address_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/update_email_address_cn.png "update_email_address_cn")

<Admonition type="info" icon="📘" title="说明">

<p>修改账号邮箱地址不会影响账单信息和告警接收人。如有需要请自行进行手动更新。</p>

</Admonition>

## 修改手机号码\{#update-mobile-phone-number}

![update_mobile_phone_number_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/update_mobile_phone_number_cn.png "update_mobile_phone_number_cn")

<Admonition type="info" icon="📘" title="说明">

<p>修改完成后，旧手机号可用于注册新账号。</p>

</Admonition>

## 更改密码\{#change-account-password}

![change_password_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/change_password_cn.png "change_password_cn")

您的密码必须符合以下要求：

- 长度为 8 至 128 个字符

- 包含大写字母（A–Z）、小写字母（a–z）和数字（0–9）

- 至少包含一个特殊字符（如 !@#$%^&*）

## 开启或关闭 MFA\{#enable-and-disable-mfa}

更多详情，请见[管理 MFA](./multi-factor-auth)。

## 关闭账号\{#delete-your-account}

<Admonition type="caution" icon="🚧" title="警告">

<p>账号关闭后 30 天内，您将无法登录或注册 Zilliz Cloud。如需重开账号，请<a href="https://support.zilliz.com.cn/hc/zh-cn/signin">提交工单</a>。账号关闭账号 30 天后，所有账号数据将被清空。</p>

</Admonition>

### 前提条件\{#before-you-start}

- 如果您是项目唯一的项目管理员且项目含有集群，请先[删除项目集群](./manage-cluster#drop-cluster)。

- 如果您是组织唯一的组织管理员，请先[删除组织](./organization-settings#delete-organization)。

### 操作步骤\{#procedures}

1. 点击界面右上角人像图标，并选择**账号设置**。

1. 在账号设置弹窗中，点击底部**删除账号**按钮。

1. 提交反馈并点击**继续**按钮。

1. 在**删除账号**弹窗中，再次输入您的账号。点击获取验证码，并输入发送至您邮箱中的验证码。阅读注意事项后并勾选。点击**下一步。**

1. 账号成功删除后，您将收到邮件提醒。

<Admonition type="caution" icon="🚧" title="警告">

<p>删除账号的操作不可逆，请谨慎操作！</p>

</Admonition>

![delete-account-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/delete-account-cn.png "delete-account-cn")

## 相关文档\{#related-topics}

- [管理组织设置](./organization-settings)

- [查看事件](./view-activities) 

