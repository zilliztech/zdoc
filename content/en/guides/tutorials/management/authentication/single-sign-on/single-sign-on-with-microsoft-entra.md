---
title: "Microsoft Entra (SAML 2.0) | Cloud"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Microsoft Entra using the SAML 2.0 protocol. | Cloud"
type: origin
token: Qkm3wPF9Titu1MkQ0fgcENs4nZc
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Microsoft Entra (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only with the Enterprise plan or higher, and BYOC deployments.

</FeatureNote>

This topic describes how to configure single sign-on (SSO) with Microsoft Entra using the SAML 2.0 protocol.

In this guide, Zilliz Cloud acts as the Service Provider (SP) and Microsoft Entra acts as the Identity Provider (IdP). The following digram illustrates the necessary steps in Zilliz Cloud and Microsoft Entra admin center.

![M3UywWSZHhlwTHbkjI8c6jTinGh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## Before you start\{#before-you-start}

- Your Zilliz Cloud organization has at least one **Dedicated (Enterprise)** cluster.

- You have access to the Microsoft Entra admin center. For more information, refer to [Microsoft Entra documentation](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center).

- You are the Organization Owner in the Zilliz Cloud organization where SSO is to be configured.

## Configuration steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

As the SP, Zilliz Cloud provides the **Identifier (Entity ID)** and **Reply URL (Assertion Consumer Service URL)** required when setting up your SAML application in Microsoft Entra.

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Microsoft Entra (SAML 2.0)** as your IdP and protocol.

1. In the **Service Provider Details** card, copy your **Identifier (Entity ID)** and **Reply URL (Assertion Consumer Service URL)**. These values will be required in [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) when setting up an application in Microsoft Entra admin center.

1. Once that's done, proceed to [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center).

</Procedures>

### Step 2: Set up an application in Microsoft Entra admin center\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

In this step, you configure Microsoft Entra (the IdP) with the SP details obtained from Zilliz Cloud.

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Set up an application in Microsoft Entra admin center" />

<Procedures>

1. Log in to the [Microsoft Entra admin center](https://aad.portal.azure.com/?ad=in-text-link).

1. In the left-side navigation pane, click **Enterprise apps**.

1. On the page that appears, click **New application**. Then, click **Create your own application**.

1. In the **Create your own application** panel, set the application name to **zilliz** and select the **Integrate any other application you don't find in the gallery (Non-gallery)** option.

1. Then, Click **Create**. Once that's done, your application is created and you will be redirected to the application details page.

1. On the application details page, choose **Single sign-on** > **SAML**.

1. In the **Basic SAML Configuration** section, click **Edit**.

1. In the **Identifier (Entity ID)** area, click **Add identifier**. Then, paste **Identifier (Entity ID)** you copied from Zilliz Cloud console in [Step 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) to the text box.

1. In the **Reply URL (Assertion Consumer Service URL)** area, click **Add reply URL**. Then, paste the **Reply URL (Assertion Consumer Service URL)** you copied from Zilliz Cloud console in [Step 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) to the text box.

1. Click **Save**.

1. Once that's done, go back to the **Single sign-on** panel of the created application and copy the **App Federation Metadata Url**. It will be required in Zilliz Cloud console in [Step 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console).

    <Admonition type="info" icon="📘" title="Notes">

    Alternatively, get the following details:
    
    - In the **SAML Certificates** section, click **Download** to save **Certificate (Base64)**. It will be required in Zilliz Cloud console if the **Manual** mode is selected in [Step 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console).
    
    - In the **Set up zilliz** section, copy the **Login URL**. It will be required in Zilliz Cloud console if the **Manual** mode is selected in [Step 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console).

    </Admonition>

</Procedures>

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

In this step, you provide Microsoft Entra’s IdP details back to Zilliz Cloud to complete the SAML trust relationship.

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Configure IdP settings in Zilliz Cloud console" />

<Procedures>

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the **Identity Provider Details** card of the **Configure Single Sign-On (SSO)** dialog box, paste the **App Federation Metadata URL** you copied from Microsoft Entra admin center in [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center).

    <Admonition type="info" icon="📘" title="Notes">

    Alternatively, if you select the **Manual** mode for IdP detail configuration, configure:
    
    - **Login URL**: Paste the Login URL you copied from Microsoft Entra admin center in [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) here.
    
    - **Certificate (Base64)**: Upload the certificate you downloaded from Microsoft Entra admin center in [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) here. Make sure the entire certificate content, including the lines beginning with `-----BEGIN CERTIFICATE-----` and ending with `-----END CERTIFICATE-----`, is provided.

    </Admonition>

1. Once that's done, click **Save**.

</Procedures>

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign Microsoft Entra application to users\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="Task 1: Assign Microsoft Entra application to users" />

Before users can access Zilliz Cloud through SSO, you need to assign the Microsoft Entra application to them:

<Procedures>

1. On the application page of the [Microsoft Entra admin center](https://aad.portal.azure.com/?ad=in-text-link), choose **Users and groups** > **+ Add user/group**.

1. Select users or groups to grant them access to the application.

</Procedures>

For details, refer to [Microsoft Entra documentation](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal).

### Task 2: Invite users to your project\{#task-2-invite-users-to-your-project}

When users log in to Zilliz Cloud via SSO for the first time, they are registered as an **Organization Member** but have no access to any project by default.

- The **Organization Owner** must invite them into the appropriate projects.

- For step-by-step instructions on how to invite users to a project, refer to [Manage Project Users](./project-users#invite-a-user-to-a-project).

After being invited to a project, the **Organization** **Owner** can share the Zilliz Cloud login URL with enterprise users so they can sign in through SSO.

If you encounter any issues during the setup or testing process, contact [Zilliz support](https://zilliz.com/contact-sales).

### Task 3: (Optional) Enable SSO enforcement\{#task-3-optional-enable-sso-enforcement}

After your SSO connection is fully configured and tested, you can optionally enable **SSO enforcement** to require all organization members to log in exclusively through SSO. When enabled, members can no longer sign in using email/password or third-party accounts (Google, GitHub).

<Admonition type="warning" icon="🚧" title="Warning">

Enabling this feature will immediately log out all members who are currently signed in with a password and block non-SSO login methods.

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

For more information, refer to [Enforce SSO in Your Organization](./enforce-sso-in-your-organization).

## FAQ\{#faq}

### What role is assigned to users who log in via SSO for the first time?\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

New users who do not already have a Zilliz Cloud account will be automatically created upon their first SSO login. These users are assigned the **Organization Member** role by default. You can modify their roles later in the Zilliz Cloud console. For detailed steps, refer to [Manage Project Users](./project-users#edit-a-collaborators-role).

### How do users access projects after SSO login?\{#how-do-users-access-projects-after-sso-login}

After logging in via SSO, users will have **Organization Member** role by default. To access specific projects, an **Organization Owner** or **Project Admin** must invite them to projects. For detailed steps, see [Manage Project Users](./project-users).

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

If the user already exists in your Zilliz Cloud organization (based on their email), they will retain their original role and permissions when logging in via SSO. The system matches users by email address and does not overwrite existing accounts.

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

Currently, each Zilliz Cloud organization supports only **one active SAML SSO configuration** at a time.