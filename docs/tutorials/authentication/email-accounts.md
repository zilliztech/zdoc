---
slug: /email-accounts
beta: FALSE
notebook: FALSE
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Email Accounts

Once you have [registered an account](./register-with-zilliz-cloud) with Zilliz Cloud, you can manage your account information, switch your login method, and unlink from your Google or GitHub account.

## Modify your account information{#modify-your-account-information}

1. Go to your __Profile__ and click __Account Settings__.

1. Click the pencil icon next to the Account section to edit the following account information:

    - First Name and Last Name

    - Company

    - Country

<Admonition type="info" icon="📘" title="Notes">

<p>Direct modification of the account's email address is not available. If you need to change your email, refer to our guide in <a href="/docs/faq-account">FAQs</a>.</p>

</Admonition>

![modify_account_info](/img/modify_account_info.png)

## Switch login method{#switch-login-method}

Maintaining a consistent login method with your initial registration is required, but Zilliz Cloud offers flexibility if you need to switch your login method.

### Switch from password login to third-party login{#switch-from-password-login-to-third-party-login}

To switch from password to third-party (Google or GitHub) login, follow the same steps for [linking your Zilliz Cloud account to a third-party service](./register-with-zilliz-cloud#linking-to-google-account), ensuring that [MFA is disabled](./multi-factor-auth#disable-mfa) beforehand.

### Switch from third-party login to password login{#switch-from-third-party-login-to-password-login}

To revert to using an email and password for login after linking your Zilliz Cloud account to a third-party account, simply [unlink your Zilliz Cloud account from the third-party service](./email-accounts#unlink-from-third-party-authentication).

### Switch between third-party logins{#switch-between-third-party-logins}

If you have already linked your Zilliz Cloud account with a third-party account and wish to switch to another third-party login, you can follow the following instructions.

1. [Unlink from the current third-party account](./email-accounts#unlink-from-third-party-authentication).

1. [Link your Zilliz Cloud account to the new desired third-party account](./register-with-zilliz-cloud).

## Unlink from third-party authentication{#unlink-from-third-party-authentication}

### Unlink from your Google account{#unlink-from-your-google-account}

1. Go to your __Profile__ and click __Account Settings__.

1. Click __Unlink from Google__.

1. Read the information in the dialog box and click __Confirm__.

1. Set a new password via the link sent to your email.

1. Your login method is now set to your work email and the new password.

![unlink_from_google](/img/unlink_from_google.png)

### Unlink from your GitHub account{#unlink-from-your-github-account}

1. Go to your __Profile__ and click __Account Settings__.

1. Click __Unlink from GitHub__.

1. Read the information in the dialog box and click __Confirm__.

1. Set a new password via the link sent to your email.

1. Your login method is now set to your work email and the new password.

## Delete your account{#delete-your-account}

<Admonition type="caution" icon="🚧" title="Warning">

<p>Deleting your account is irreversible. Exercise caution and ensure all necessary preparations are made before proceeding with this action.</p>

</Admonition>

### Before you start{#before-you-start}

Ensure you meet the following criteria before proceeding:

- If you are the only project owner in a project with clusters, [delete the project clusters](./manage-cluster).

- If you are the only organization owner, delete the organization.

### Procedures{#procedures}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Click the profile icon in the upper right corner. Click __Account Settings__.

1. In the __Account__ __Settings __window, click the __Delete Account__ button.

1. Before confirming to delete your account, fill out the feedback form first. Click the button to proceed with the deletion.

1. Enter your account email address again in the text box. Click __Send Verification Code__ and enter the code you received in your email inbox. Read the information below and tick the boxes. Click __Next__ to continue.

1. You will receive an email notification when your account is successfully deleted.

![delete-account-en](/img/delete-account-en.png)

## Related topics{#related-topics}

- [Manage Organization Information](./organizations)

- [Delete Your Organization](./delete-your-organization)

- [View Activities](./view-activities)

