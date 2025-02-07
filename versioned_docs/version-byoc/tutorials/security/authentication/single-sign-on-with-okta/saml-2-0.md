---
title: "SAML 2.0 | BYOC"
slug: /saml-2-0
sidebar_label: "Configure SAML SSO with Okta"
beta: CONTACT SALES
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Okta using the SAML 2.0 protocol. | BYOC"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search

---

import Admonition from '@theme/Admonition';


# SAML 2.0

This topic describes how to configure single sign-on (SSO) with Okta using the SAML 2.0 protocol.

SAML 2.0 is a standard protocol used by many identity providers and offers broad compatibility. Choose this option if your organization requires SAML 2.0 for compliance reasons. For details, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/apps/apps-about-saml.htm).

![KywHwe7VIhcwsAbecTpcEsL3njb](/byoc/KywHwe7VIhcwsAbecTpcEsL3njb.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud SSO is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Before you start{#before-you-start}

Before you begin the SSO configuration, make sure the following conditions are met:

- You are the Organization Owner of the organization where SSO is to be configured.

- You have Admin access to the Okta console. For more information, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm).

## Step 1: Create SAML app integration in Okta{#step-1-create-saml-app-integration-in-okta}

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **SAML 2.0** and click **Next**.

1. Set a custom app name and click **Next**.

1. In the **Configure SAML** step, you'll need to provide some information. For now, use any placeholder values. Example:

    - **Single Sign On URL**: **https://cloud.zilliz.com/sso/saml/acs** (You'll update this later)

    - **Audience Restriction**: **https://cloud.zilliz.com** (You'll update this later)

1. Click **Next**, review your settings, then click **Finish**. You will be redirected to the application page.

    ![sso-2-1](/byoc/sso-2-1.png)

1. In the **SAML 2.0** card of the **Sign On** tab, click **More details**. Then, copy the following credentials and certificate: **Sign on URL**, **Issuer**, and **Signing Certificate**. This will be required for setting up your IdP in the Zilliz Cloud console.

    For more information about Okta settings, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm).

    ![sso-2-2](/byoc/sso-2-2.png)

## Step 2: Configure SAML SSO on Zilliz Cloud{#step-2-configure-saml-sso-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, choose **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the **Configure Single Sign-On (SSO)** dialog, you will see two options - **SAML 2.0** and **Okta Workforce**. For this guide, select **SAML 2.0** to proceed with the SAML 2.0 integration.

1. In the **Configure Single Sign-On (SSO)** step, enter the IdP settings using the credentials and certificate obtained from Okta in [Step 1](./saml-2-0).

    - **Single Sign-On URL**: Paste the **Sign on URL** value obtained from Okta into this field. This URL receives the SAML authentication requests from Okta.

    - **Entity ID**: Paste the **Issuer** value obtained from Okta into this field. This identifier is used to distinguish the issuer of SAML requests, responses, or assertions,  ensuring that messages from Okta are correctly recognized and accepted by Zilliz Cloud.

    - **Certificate**: Paste the **Signing Certificate** value obtained from Okta into this field. This public key certificate is used to verify the digital signatures of SAML assertions, enabling Zilliz Cloud to authenticate the source of the SAML data securely.

1. Click **Save** to proceed.

![sso-saml-1](/byoc/sso-saml-1.png)

## Step 3: Update Okta app integration{#step-3-update-okta-app-integration}

After saving the Okta integration details on Zilliz Cloud, you'll be provided with a redirect URL:

1. Copy the provided redirect URL from the Zilliz Cloud console.

1. Return to the Okta Admin console and navigate to the Zilliz Cloud application you created.

1. Edit the SAML settings and update the following fields with the redirect URL you copied from Zilliz Cloud: 

    - **Single sign-on URL**

    - **Audience Restriction**

1. Save the changes in the Okta Admin Console.

1. Go back to the Zilliz Cloud console and confirm that you've added the redirect URL in Okta.

You will also see a Zilliz Cloud login URL. Save this URL as it will be used for SSO login once the setup is complete.

![sso-3](/byoc/sso-3.png)

## Step 4: Assign Okta application to users{#step-4-assign-okta-application-to-users}

Before users can access Zilliz Cloud through SSO, you need to assign the Okta application to them:

1. In the [Okta Admin console](https://login.okta.com/), go to **Directory** > **People**.

1. Select a user and go to the **Applications** tab.

1. Click **Assign Applications** and find the Zilliz Cloud application.

1. Assign the application to the user and save the changes.

Repeat this process for all users who need SSO access to Zilliz Cloud. For more information, refer to [Okta official documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm).

![sso-4](/byoc/sso-4.png)

## Test configuration{#test-configuration}

To ensure your SSO setup is functional:

1. Open a new browser window and navigate to the Zilliz Cloud SSO login URL provided earlier.

1. You should be redirected to the Okta login page.

1. Log in using the credentials of a user who has been assigned the Zilliz Cloud application in Okta.

1. If SSO is configured correctly, you will be redirected to the Zilliz Cloud console after successful authentication.

<Admonition type="info" icon="📘" title="Notes">

<p>By default, users logging in via SSO are granted the Organization Member role. To expand their permissions, you can modify their roles in the Zilliz Cloud console.</p>

</Admonition>

If you encounter any issues during the setup or testing process, please contact Zilliz support for assistance.