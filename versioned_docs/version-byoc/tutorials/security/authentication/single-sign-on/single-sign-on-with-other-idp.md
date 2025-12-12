---
title: "Other IdP (SAML 2.0) | BYOC"
slug: /single-sign-on-with-other-idp
sidebar_label: "Other IdP (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) in Zilliz Cloud with any identity provider (IdP) that supports the SAML 2.0 protocol. | BYOC"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - other
  - idp
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Other IdP (SAML 2.0)

This topic describes how to configure single sign-on (SSO) in Zilliz Cloud with any identity provider (IdP) that supports the SAML 2.0 protocol.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud provides dedicated integration guides for <a href="./single-sign-on-with-okta">Okta</a>, <a href="./single-sign-on-with-google-workspace">Google Workspace</a>, and <a href="./single-sign-on-with-microsoft-entra">Microsoft Entra</a>, but any standards-compliant SAML 2.0 IdP can be used with the <strong>Other IdP (SAML 2.0)</strong> option.</p>

</Admonition>

## Before you start\{#before-you-start}

- Your Zilliz Cloud organization has at least one **Dedicated (Enterprise)** cluster.

- You are the **Organization Owner** in the Zilliz Cloud organization where SSO is to be configured.

- You have admin access to the IdP you plan to use.

- Refer to your IdP’s official documentation for IdP-specific setup details.

## Configuration steps\{#configuration-steps}

### Step 1: Access service provider details in Zilliz Cloud console\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="Step 1: Access service provider details in Zilliz Cloud" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, locate the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Other IdP (SAML)** as your IdP and protocol.

1. In the **Service Provider Details** card, copy the following values:

    - **SP Entity ID**

    - **ACS URL**

These values will be required in [Step 2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console) when creating a SAML application in your IdP.

### Step 2: Create a SAML app in your IdP console\{#step-2-create-a-saml-app-in-your-idp-console}

The exact process varies depending on your IdP. In general:

1. Sign in to your IdP’s administrator console.

1. Create a new SAML 2.0 application (sometimes called a SAML connection or integration).

1. When prompted to provide service provider information, enter:

    - The **SP Entity ID** from [Step 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console).

    - The **ACS URL** from [Step 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console).

1. Save the application, then obtain your IdP configuration in one of the following forms:

    - **Option 1 – Metadata URL/File**: Most IdPs provide a downloadable XML file or a public URL containing all necessary SAML metadata.

    - **Option 2 – Manual**: If metadata is not available, collect the following from your IdP:

        - **IdP SSO URL** (the endpoint where Zilliz Cloud will send authentication requests)

        - **x.509 Certificate** (including the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines)

You will use this information in [Step 3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console).

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the **Identity Provider Details** card of the Configure Single Sign-On (SSO) dialog box, choose one of the following methods:

    **Option 1 – Metadata URL/File**

    - Paste the **Metadata URL** you copied from your IdP, or upload the Metadata XML file you downloaded.

    - Zilliz Cloud will automatically import the necessary IdP details, including the certificate.

    **Option 2 – Manual**

    - Enter the **IdP SSO URL** from your IdP.

    - Upload or paste the IdP signing certificate in X.509 format. Ensure it includes the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines.

1. Click **Save**.

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign SAML app to users in your IdP\{#task-1-assign-saml-app-to-users-in-your-idp}

Before users can sign in via SSO, you must grant them access to the SAML app in your IdP:

- Assign the app to specific users or groups.

- Ensure that each assigned user’s email address matches their Zilliz Cloud account email.

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