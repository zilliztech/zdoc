---
title: "FAQ: Get Started | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ: Get Started"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and the corresponding solution. | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1
displayed_sidebar: default

---

# FAQ: Get Started

This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and the corresponding solution.

## Contents

- [Is there any performance comparison between Zilliz Cloud and other vector search solutions?](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Which type of index is supported by Zilliz Cloud?](#which-type-of-index-is-supported-by-zilliz-cloud)
- [What is the search latency of Zilliz Cloud?](#what-is-the-search-latency-of-zilliz-cloud)
- [Is pricing the same in every region?](#is-pricing-the-same-in-every-region)
- [What happens after the free trial?](#what-happens-after-the-free-trial)
- [What is the pricing of Zilliz Cloud on Marketplaces?](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [Can I apply for more credits?](#can-i-apply-for-more-credits)
- [Can I extend my free trial?](#can-i-extend-my-free-trial)
- [How can I get further technical support?](#how-can-i-get-further-technical-support)
- [Can I sign up with my GitHub account?](#can-i-sign-up-with-my-github-account)
- [During signup, I did not receive the email verification code. What should I do?](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [Why did my registration fail?](#why-did-my-registration-fail)
- [Do I need to disable MFA before signing up with Google or GitHub?](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## FAQs




### Is there any performance comparison between Zilliz Cloud and other vector search solutions?\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

Yes. You can use [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool), a vector database benchmark tool to compare the performance of Zilliz Cloud and other mainstream vector databases and cloud services.

### Which type of index is supported by Zilliz Cloud?\{#which-type-of-index-is-supported-by-zilliz-cloud}

Currently, Zilliz Cloud only supports AUTOINDEX, a proprietary index type that can help you achieve better search performance. For more details, see [AUTOINDEX Explained](./autoindex-explained).

However, please[ submit a request](https://support.zilliz.com/hc/en-us) if you are familiar with using [any of the indexes](https://milvus.io/docs/index.md) we support. We can help you evaluate your application demand and enable the indexes for you.

### What is the search latency of Zilliz Cloud?\{#what-is-the-search-latency-of-zilliz-cloud}

The search latency depends on the cluster type and data volume. 

| top_k | Latency of Performance-optimized cluster (768-dim 1M vectors) | Latency of Capacity-optimized cluster (768-dim 5M vectors) |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

For more details about the test result, see [Select the Right CU](./cu-types-explained).

### Is pricing the same in every region?\{#is-pricing-the-same-in-every-region}

In short, cloud service prices often vary across providers and regions. Several factors contribute to these differences, such as the costs of the underlying physical resources that cloud database services rely on. For more details, see [Pricing](https://zilliz.com/pricing).

### What happens after the free trial?\{#what-happens-after-the-free-trial}

Once the free trial ends, you can still access your free clusters. However, all the data in your serverless and dedicated clusters will be moved to the Recycle Bin and will be retained there for 30 days. To safely recover your cluster data, provide a payment method. For more details, refer to [Try Zilliz Cloud For Free](./free-trials#use-free-trial).

### What is the pricing of Zilliz Cloud on Marketplaces?\{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

The Marketplace price is the same as the list price on the [Zilliz Cloud Pricing](https://zilliz.com/pricing) page. 

If you have negotiated a discount with your account executive, your negotiated price applies.

For pricing questions, please [contact sales](http://zilliz.com/contact-sales).

### Can I apply for more credits?\{#can-i-apply-for-more-credits}

When you register on Zilliz Cloud with a work email you’ll receive &#36;100 in free credits. You can earn an extra &#36;100 credits by subscribing to Zilliz Cloud on [Marketplaces](./subscribe-on-aws-marketplace). For extra credits and discounts, please [contact sales](https://zilliz.com/contact-sales).

### Can I extend my free trial?\{#can-i-extend-my-free-trial}

Yes, you can. When you register on Zilliz Cloud, you receive &#36;100 in credits valid for 30 days. By [adding a payment method](./payment-billing), you can extend the validity of these credits to 1 year.

### How can I get further technical support?\{#how-can-i-get-further-technical-support}

Please submit at request at the Zilliz cloud [support portal](https://support.zilliz.com/hc/en-us).

### Can I sign up with my GitHub account?\{#can-i-sign-up-with-my-github-account}

Yes, but your GitHub account must have a public email address. Go to your GitHub profile settings and make your email public before registering.

### During signup, I did not receive the email verification code. What should I do?\{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

Click "Resend" on the verification page. If you still do not receive it, please check your spam folder.

### Why did my registration fail?\{#why-did-my-registration-fail}

You may already have an account with the same email. Try logging in instead. If the issue persists, [contact support](https://support.zilliz.com/).

### Do I need to disable MFA before signing up with Google or GitHub?\{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

Yes. If your Google or GitHub account has provider-managed MFA enabled, disable it before linking to ensure a smooth registration. You can re-enable it afterward.
