---
slug: /delete-your-account
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Manage Your Account

Once you have created an account on Zilliz Cloud, you can manage your account information, switch your login method, and unlink from your Google or GitHub account.

## Modify your account information{#modify-your-account-information}

1. Go to your **Profile** and click **Account Settings**.

1. Click the pencil icon next to the Account section to edit the following account information:
    - First Name and Last Name

    - Company 

    - Country

<Admonition type="info" icon="📘" title="Notes">

Direct modification of the account's email address is not available. If you need to change your email, refer to our guide: [How to Change My Account Email Address?](https://chat.openai.com/c/0b1274aa-d87a-4104-9a5f-b0daeb3fee59#)

</Admonition>

![modify_account_info](/img/modify_account_info.png)

## Switch login method{#switch-login-method}

Maintaining a consistent login method with your initial registration is required, but Zilliz Cloud offers flexibility if you need to switch your login method.

### Switch from password login to third-party login{#switch-from-password-login-to-third-party-login}

To switch from password to third-party (Google or GitHub) login, follow the same steps for [linking your Zilliz Cloud account to a third-party service](./register-with-zilliz-cloud#linking-to-google-account), ensuring that [MFA is disabled](./multi-factor-authentication#disable-mfa) beforehand.

### Switch from third-party login to password login{#switch-from-third-party-login-to-password-login}

To revert to using an email and password for login after linking your Zilliz Cloud account to a third-party account, simply [unlink your Zilliz Cloud account from the third-party service](./delete-your-account#unlink-from-third-party-authentication).

### Switch between third-party logins{#switch-between-third-party-logins}

If you have already linked your Zilliz Cloud account with a third-party account and wish to switch to another third-party login, you can follow the following instructions.

1. [Unlink from the current third-party account](./delete-your-account#unlink-from-third-party-authentication).

1. [Link your Zilliz Cloud account to the new desired third-party account](./register-with-zilliz-cloud).

## Unlink from third-party authentication{#unlink-from-third-party-authentication}

### Unlink from your Google account{#unlink-from-your-google-account}

1. Go to your **Profile** and click **Account Settings**.

1. Click **Unlink from Google**.

1. Read the information in the dialog box and click **Confirm**.

1. Set a new password via the link sent to your email.

1. Your login method is now set to your work email and the new password.

![unlink_from_google](/img/unlink_from_google.png)

### Unlink from your Github account{#unlink-from-your-github-account}

1. Go to your **Profile** and click **Account Settings**.

1. Click **Unlink from GitHub**.

1. Read the information in the dialog box and click **Confirm**.

1. Set a new password via the link sent to your email.

1. Your login method is now set to your work email and the new password.

## Delete your account{#delete-your-account}

<Admonition type="caution" icon="🚧" title="Warning">

Deleting your account is irreversible. Exercise caution and ensure all necessary preparations are made before proceeding with this action.

</Admonition>

### Before you start{#before-you-start}

Ensure you meet the following criteria before proceeding:

- If you are the only project owner in a project with clusters, [delete the project clusters](./manage-cluster).

- If you are the only organization owner, delete the organization.

### Procedures{#procedures}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Click the profile icon in the upper right corner. Click **Account Settings**.

1. In the **Account** **Settings **window, click the **Delete Account** button.

1. Before confirming to delete your account, fill out the feedback form first. Click the button to proceed with the deletion.

1. Enter your account email address again in the text box. Click **Send Verification Code** and enter the code you received in your email inbox. Read the information below and tick the boxes. Click **Next** to continue.

1. You will receive an email notification when your account is successfully deleted.

![delete-account-en](/img/delete-account-en.png)

## Related topics{#related-topics}

- [Organizations & Projects](https://zilliverse.feishu.cn/wiki/BAvrw3PkDixq7UkzUcacCrFQnrb) 

- [Roles & Privileges](https://zilliverse.feishu.cn/wiki/SzFVwtUcYiB1ubkWA06c0N9hnNf) 

- [Add Organization Members](https://zilliverse.feishu.cn/wiki/UEnNwf5z1iU0BekXyHOcVzn9nmc) 

- [Remove Members](https://zilliverse.feishu.cn/wiki/F1kQw4qRfi6v3UkOc2AcENBXnbe) 

- [Manage Organization Information](./manage-orgs-and-members) 

- [Delete Your Organization](./delete-your-org) 

- [View Activities](./view-activities) 
