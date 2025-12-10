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
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - microsoft
  - entra
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Microsoft Entra (SAML 2.0)

This topic describes how to configure single sign-on (SSO) with Microsoft Entra using the SAML 2.0 protocol.

In this guide, Zilliz Cloud acts as the Service Provider (SP) and Microsoft Entra acts as the Identity Provider (IdP). The following digram illustrates the necessary steps in Zilliz Cloud and Microsoft Entra admin center.

![M3UywWSZHhlwTHbkjI8c6jTinGh](https://zdoc-images.s3.us-west-2.amazonaws.com/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## Before you start\{#before-you-start}

- Your Zilliz Cloud organization has at least one **Dedicated (Enterprise)** cluster.

- You have access to the Microsoft Entra admin center. For more information, refer to [Microsoft Entra documentation](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center).

- You are the Organization Owner in the Zilliz Cloud organization where SSO is to be configured.

## Configuration steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

As the SP, Zilliz Cloud provides the **Identifier (Entity ID)** and **Reply URL (Assertion Consumer Service URL)** required when setting up your SAML application in Microsoft Entra.

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="Step 1: Access service provider details in Zilliz Cloud console" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Microsoft Entra (SAML 2.0)** as your IdP and protocol.

1. In the **Service Provider Details** card, copy your **Identifier (Entity ID)** and **Reply URL (Assertion Consumer Service URL)**. These values will be required in [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) when setting up an application in Microsoft Entra admin center.

1. Once that's done, proceed to [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center).

### Step 2: Set up an application in Microsoft Entra admin center\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

In this step, you configure Microsoft Entra (the IdP) with the SP details obtained from Zilliz Cloud.

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Set up an application in Microsoft Entra admin center" />

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

    <p>Alternatively, get the following details:</p>
    <ul>
    <li><p>In the <strong>SAML Certificates</strong> section, click <strong>Download</strong> to save <strong>Certificate (Base64)</strong>. It will be required in Zilliz Cloud console if the <strong>Manual</strong> mode is selected in <a href="./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a>.</p></li>
    <li><p>In the <strong>Set up zilliz</strong> section, copy the <strong>Login URL</strong>. It will be required in Zilliz Cloud console if the <strong>Manual</strong> mode is selected in <a href="./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a>.</p></li>
    </ul>

    </Admonition>

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

In this step, you provide Microsoft Entra’s IdP details back to Zilliz Cloud to complete the SAML trust relationship.

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Configure IdP settings in Zilliz Cloud console" />

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the **Identity Provider Details** card of the **Configure Single Sign-On (SSO)** dialog box, paste the **App Federation Metadata URL** you copied from Microsoft Entra admin center in [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Alternatively, if you select the <strong>Manual</strong> mode for IdP detail configuration, configure:</p>
    <ul>
    <li><p><strong>Login URL</strong>: Paste the Login URL you copied from Microsoft Entra admin center in <a href="./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center">Step 2</a> here.</p></li>
    <li><p><strong>Certificate (Base64)</strong>: Upload the certificate you downloaded from Microsoft Entra admin center in <a href="./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center">Step 2</a> here. Make sure the entire certificate content, including the lines beginning with <code>-----BEGIN CERTIFICATE-----</code> and ending with <code>-----END CERTIFICATE-----</code>, is provided.</p></li>
    </ul>

    </Admonition>

1. Once that's done, click **Save**.

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign Microsoft Entra application to users\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="Task 1: Assign Microsoft Entra application to users" />

Before users can access Zilliz Cloud through SSO, you need to assign the Microsoft Entra application to them:

1. On the application page of the [Microsoft Entra admin center](https://aad.portal.azure.com/?ad=in-text-link), choose **Users and groups** > **+ Add user/group**.

1. Select users or groups to grant them access to the application.

For details, refer to [Microsoft Entra documentation](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal).

### Task 2: Invite users to your project\{#task-2-invite-users-to-your-project}

When users log in to Zilliz Cloud via SSO for the first time, they are registered as an **Organization Member** but have no access to any project by default.

- The **Organization Owner** must invite them into the appropriate projects.

- For step-by-step instructions on how to invite users to a project, refer to [Manage Project Users](./project-users#invite-a-user-to-a-project).

After being invited to a project, the **Organization** **Owner** can share the Zilliz Cloud login URL with enterprise users so they can sign in through SSO.

If you encounter any issues during the setup or testing process, contact [Zilliz support](https://zilliz.com/contact-sales).

## FAQ\{#faq}

### What role is assigned to users who log in via SSO for the first time?\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

New users who do not already have a Zilliz Cloud account will be automatically created upon their first SSO login. These users are assigned the **Organization Member** role by default. You can modify their roles later in the Zilliz Cloud console. For detailed steps, refer to [Manage Project Users](./project-users#edit-a-collaborators-role-or-remove-a-collaborator).

### How do users access projects after SSO login?\{#how-do-users-access-projects-after-sso-login}

After logging in via SSO, users will have **Organization Member** role by default. To access specific projects, an **Organization Owner** or **Project Admin** must invite them to projects. For detailed steps, see [Manage Project Users](./project-users).

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

If the user already exists in your Zilliz Cloud organization (based on their email), they will retain their original role and permissions when logging in via SSO. The system matches users by email address and does not overwrite existing accounts.

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

Currently, each Zilliz Cloud organization supports only **one active SAML SSO configuration** at a time.