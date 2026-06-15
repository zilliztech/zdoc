---
title: "FAQ: Get Started | BYOC"
slug: /faq-get-started
sidebar_label: "FAQ: Get Started"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and the corresponding solution. | BYOC"
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
- [How can I get further technical support?](#how-can-i-get-further-technical-support)
- [Can I sign up with my GitHub account?](#can-i-sign-up-with-my-github-account)
- [During signup, I did not receive the email verification code. What should I do?](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [Why did my registration fail?](#why-did-my-registration-fail)
- [Do I need to disable MFA before signing up with Google or GitHub?](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## FAQs




### Is there any performance comparison between Zilliz Cloud and other vector search solutions?{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

Yes. You can use [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool), a vector database benchmark tool to compare the performance of Zilliz Cloud and other mainstream vector databases and cloud services.

### Which type of index is supported by Zilliz Cloud?{#which-type-of-index-is-supported-by-zilliz-cloud}

Currently, Zilliz Cloud only supports AUTOINDEX, a proprietary index type that can help you achieve better search performance. For more details, see [AUTOINDEX Explained](./autoindex-explained).

However, please[ submit a request](https://support.zilliz.com/hc/en-us) if you are familiar with using [any of the indexes](https://milvus.io/docs/index.md) we support. We can help you evaluate your application demand and enable the indexes for you.

### What is the search latency of Zilliz Cloud?{#what-is-the-search-latency-of-zilliz-cloud}

The search latency depends on the cluster type and data volume. 

| top_k | Latency of Performance-optimized cluster (768-dim 1M vectors) | Latency of Capacity-optimized cluster (768-dim 5M vectors) |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

For more details about the test result, see [Select the Right CU](./cu-types-explained).

### How can I get further technical support?{#how-can-i-get-further-technical-support}

Please submit at request at the Zilliz cloud [support portal](https://support.zilliz.com/hc/en-us).

### Can I sign up with my GitHub account?{#can-i-sign-up-with-my-github-account}

Yes, but your GitHub account must have a public email address. Go to your GitHub profile settings and make your email public before registering.

### During signup, I did not receive the email verification code. What should I do?{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

Click "Resend" on the verification page. If you still do not receive it, please check your spam folder.

### Why did my registration fail?{#why-did-my-registration-fail}

You may already have an account with the same email. Try logging in instead. If the issue persists, [contact support](https://support.zilliz.com/).

### Do I need to disable MFA before signing up with Google or GitHub?{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

Yes. If your Google or GitHub account has provider-managed MFA enabled, disable it before linking to ensure a smooth registration. You can re-enable it afterward.
