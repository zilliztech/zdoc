---
title: "Microsoft Entra | BYOC"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra"
beta: CONTACT SALES
notebook: FALSE
description: "Microsoft Entra with Microsoft Entra over the SAML protocol. | BYOC"
type: origin
token: Qkm3wPF9Titu1MkQ0fgcENs4nZc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - microsoft
  - entra
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


# Microsoft Entra

[Microsoft Entra](https://www.microsoft.com/en-us/security/business/microsoft-entra) is a unified identity and access management solution that enhances security, compliance, and user experience across hybrid and multi-cloud environments. Zilliz Cloud allows you to configure single sign-on (SSO) with Microsoft Entra over the SAML protocol.

![M3UywWSZHhlwTHbkjI8c6jTinGh](/img/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Though the SSO feature is in <strong>General Availability</strong>, please <a href="https://zilliz.com/contact-sales">contact</a><a href="https://zilliz.com/contact-sales"> sales</a> for access.</p>

</Admonition>

## Before you start{#before-you-start}

Before you begin the SSO configuration, make sure the following conditions are met:

- You are the Organization Owner of the organization where SSO is to be configured.

- You have access to the Microsoft Entra admin center. For more information, refer to [Microsoft Entra documentation](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center).

## Step 1: Create an application on Microsoft Entra{#step-1-create-an-application-on-microsoft-entra}

![sso-ms-entra-1](/img/sso-ms-entra-1.png)

1. Log in to the [Microsoft Entra admin center](https://aad.portal.azure.com/?ad=in-text-link).

1. In the left-side navigation pane, choose **Applications** > **Enterprise applications**.

1. On the page that appears, choose **All applications** > **+ New application**. Then, click **+ Create your own application**.

1. In the **Create your own application** pane, enter the application name and select **Integrate any other application you don't find in the gallery (Non-gallery)**. Then, the application is created.

## Step 2: Set up SAML-based SSO{#step-2-set-up-saml-based-sso}

![sso-ms-entra-2](/img/sso-ms-entra-2.png)

1. On the application page, choose **Single sign-on** > **SAML**.

1. In the **Basic SAML Configuration** section, click **Edit**.

1. Configure **Identifier (Entity ID)** and **Reply URL**, then click **Save**:

    - **Identifier**: The unique ID that identifies your application to Microsoft Entra ID. This value must be unique across all applications in your Microsoft Entra tenant. In this example, enter **zilliz**.

    - **Reply URL (Assertion Consumer Service URL)**: The URL where the application expects to receive the authentication token. Enter a placeholder value for now and update it later after configuring the settings on Zilliz Cloud console.

1. Download the certificate and copy the **Login URL**.

1. Then, switch to the Zilliz Cloud console for further configuration.

## Step 3: Configure SSO on Zilliz Cloud{#step-3-configure-sso-on-zilliz-cloud}

![sso-saml-1](/img/sso-saml-1.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, choose **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the **Configure Single Sign-On (SSO)** dialog, you will see two options - **SAML 2.0** and **Okta Workforce**. For this guide, select **SAML 2.0** to proceed with the SAML 2.0 integration.

1. In the **Configure Single Sign-On (SSO)** step, enter the IdP settings using the certificate and **Login URL** obtained from Microsoft Entra in [Step 2](./single-sign-on-with-microsoft-entra).

    - **Single Sign-On URL**: Paste the **Login URL** value obtained from Microsoft Entra into this field. This URL receives the SAML authentication requests from Microsoft Entra.

    - **Entity ID**: Enter **zilliz**. This identifier is used to distinguish the issuer of SAML requests, responses, or assertions,  ensuring that messages from Microsoft Entra are correctly recognized and accepted by Zilliz Cloud.

    - **Certificate**: Open the certificate downloaded from Microsoft Entra and paste the certificate details into this field. This public key certificate is used to verify the digital signatures of SAML assertions, enabling Zilliz Cloud to authenticate the source of the SAML data securely.

1. Click **Save** to proceed.

## Step 4: Update Microsoft Entra integration{#step-4-update-microsoft-entra-integration}

![sso-ms-entra-3](/img/sso-ms-entra-3.png)

After saving the integration details on Zilliz Cloud, you'll be provided with a redirect URL:

1. Copy the provided redirect URL from the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Return to the [Microsoft Entra admin center](https://aad.portal.azure.com/?ad=in-text-link) and navigate to the application you created.

1. Edit the SAML settings to replace the **Reply URL** with the redirect URL you copied from Zilliz Cloud, and save changes.

## Step 5: Assign Microsoft Entra application to users{#step-5-assign-microsoft-entra-application-to-users}

![sso-ms-entra-4](/img/sso-ms-entra-4.png)

Before users can access Zilliz Cloud through SSO, you need to assign the Microsoft Entra application to them:

1. On the application page of the [Microsoft Entra admin center](https://aad.portal.azure.com/?ad=in-text-link), choose **Users and groups** > **+ Add user/group**.

1. Select users or groups to grant them access to the application.

For details, refer to [Microsoft Entra documentation](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal).

## Test configuration{#test-configuration}

To ensure your SSO setup is functional:

1. Open a new browser window and navigate to the Zilliz Cloud SSO login URL provided earlier.

1. You should be redirected to the login page of the Microsoft Entra admin center.

1. Log in using the credentials of a user who has been assigned the application.

1. If SSO is configured correctly, you will be redirected to the Zilliz Cloud console after successful authentication.

<Admonition type="info" icon="📘" title="Notes">

<p>By default, users logging in via SSO are granted the Organization Member role. To expand their permissions, you can modify their roles in the Zilliz Cloud console.</p>

</Admonition>

If you encounter any issues during the setup or testing process, please contact Zilliz support for assistance.