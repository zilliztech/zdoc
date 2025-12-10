---
title: "Email Accounts | Cloud"
slug: /email-accounts
sidebar_label: "Email Accounts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Once you have registered an account with Zilliz Cloud, you can manage your account information, switch your login method, and unlink from your Google or GitHub account. | Cloud"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - email accounts
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';


# Email Accounts

Once you have [registered an account](./register-with-zilliz-cloud) with Zilliz Cloud, you can manage your account information, switch your login method, and unlink from your Google or GitHub account.

## Modify your profile information\{#modify-your-profile-information}

1. Go to your **Profile** and click **Account Settings**.

1. You can edit the following account information:

    - Name

    - Company

    - Country

![modify_account_info](https://zdoc-images.s3.us-west-2.amazonaws.com/modify_account_info.png "modify_account_info")

## Update account email address\{#update-account-email-address}

![update_email_address](https://zdoc-images.s3.us-west-2.amazonaws.com/update_email_address.png "update_email_address")

<Admonition type="info" icon="📘" title="Notes">

<p>Updating the email address will not affect the receiver of billing invoices and alerts. Please update these information manually if necessary.</p>

</Admonition>

## Change account password\{#change-account-password}

![change_password](https://zdoc-images.s3.us-west-2.amazonaws.com/change_password.png "change_password")

Your password must be at least 8 characters long and include at least 3 of the following character types:

- Lowercase letters (a–z)

- Uppercase letters (A–Z)

- Numbers (0–9)

- Special characters (e.g., !@#$%^&*)

## Enable and disable MFA\{#enable-and-disable-mfa}

Refer to [MFA](./multi-factor-auth) for more information.

## Switch login method\{#switch-login-method}

Maintaining a consistent login method with your initial registration is required, but Zilliz Cloud offers flexibility if you need to switch your login method.

<Admonition type="info" icon="📘" title="Notes">

<p>For organization users, you can set up Single Sign-on (SSO) with the identity provider (IdP) Okta. This allows your organization users to authenticate with Okta and then seamlessly access Zilliz Cloud using their business email rather than creating a separate Zilliz Cloud account. For details, refer to <a href="./single-sign-on-with-okta">Single Sign-on with Okta</a>.</p>

</Admonition>

### Switch from password login to third-party login\{#switch-from-password-login-to-third-party-login}

To switch from password to third-party (Google or GitHub) login, follow the same steps for [linking your Zilliz Cloud account to a third-party service](./register-with-zilliz-cloud#linking-to-google-account), ensuring that [MFA is disabled](./multi-factor-auth#disable-mfa) beforehand.

### Switch from third-party login to password login\{#switch-from-third-party-login-to-password-login}

To revert to using an email and password for login after linking your Zilliz Cloud account to a third-party account, simply [unlink your Zilliz Cloud account from the third-party service](./email-accounts#unlink-from-third-party-authentication).

### Switch between third-party logins\{#switch-between-third-party-logins}

If you have already linked your Zilliz Cloud account with a third-party account and wish to switch to another third-party login, you can follow the following instructions.

1. [Unlink from the current third-party account](./email-accounts#unlink-from-third-party-authentication).

1. [Link your Zilliz Cloud account to the new desired third-party account](./register-with-zilliz-cloud).

## Unlink from third-party authentication\{#unlink-from-third-party-authentication}

### Unlink from your Google account\{#unlink-from-your-google-account}

1. Go to your **Profile** and click **Account Settings**.

1. Click **Unlink from Google**.

1. Click **Unlink**. 

    - If you have already set a password, your Google account will be unlinked directly and you can log in with your original email and password.

    - If you have not set a password yet, set a new password via the link sent to your email. Once the password is set, your login method is changed to your work email and the new password.

![unlink_from_google](https://zdoc-images.s3.us-west-2.amazonaws.com/unlink_from_google.png "unlink_from_google")

### Unlink from your GitHub account\{#unlink-from-your-github-account}

1. Go to your **Profile** and click **Account Settings**.

1. Click **Unlink from GitHub**.

1. Click **Unlink**. 

    - If you have already set a password, your GitHub account will be unlinked directly and you can log in with your original email and password.

    - If you have not set a password yet, set a new password via the link sent to your email. Once the password is set, your login method is changed to your work email and the new password.

![unlink_from_github](https://zdoc-images.s3.us-west-2.amazonaws.com/unlink_from_github.png "unlink_from_github")

## Close your account\{#close-your-account}

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once the account is closed, you cannot use it to log into Zilliz Cloud. If you change your mind and need to reopen the account, please create a support ticket at the <a href="https://support.zilliz.com/hc/en-us">Zilliz Cloud Support Portal</a>. After 30 days, all data in this account will be cleaned.</p>

</Admonition>

### Before you start\{#before-you-start}

Ensure you meet the following criteria before proceeding:

- If you are the only project admin in a project with clusters, [delete the project clusters](./manage-cluster).

- If you are the only organization owner, delete the organization.

### Procedures\{#procedures}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Click the profile icon in the upper right corner. Click **Account Settings**.

1. In the **Account** **Settings** window, click the **Close Account** button.

1. Tell us your reason to leave Zilliz Cloud and submit the feedback.

1. Enter your account email address again in the text box. Click **Send Verification Code** and enter the code you received in your email inbox. Read the information below and tick the boxes. Click **Next** to continue.

1. You will receive an email notification when your account is successfully deleted.

![delete-account-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-account-en.png "delete-account-en")