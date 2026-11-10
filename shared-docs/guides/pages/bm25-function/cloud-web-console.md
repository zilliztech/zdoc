### Via web console

Alternatively, you can create a collection with a BM25 function in the [Zilliz Cloud console](https://cloud.zilliz.com/login). The names and limits used below are examples; set them according to your own data.

<Supademo id="cmwabmbzc0dbiqmfqcxfs9cyw" title=""  />

<Procedures>

1. Open the Create Collection page.

    In the console, open your cluster and click **Create Collection**.

1. Add the sparse vector field.

    Select the **vector** field and change its **Field Type** to **SPARSE_FLOAT_VECTOR**. This field stores the sparse vectors that the BM25 function generates.

1. Add the text field.

    Click **+ Field**, set **Field Name** to a name of your choice, for example `var`, and set **Field Type** to **VARCHAR**. Set **Max Length** to the length that covers the longest text you plan to insert.

1. Add the BM25 function.

    Scroll to **Properties and Advanced Settings** and click **+ Function**, then set **Function Type** to **BM25**.

1. Configure the function.

    | Setting | Description |
    | --- | --- |
    | **Input Field** | Select the VARCHAR field that stores the raw text, for example `var`. |
    | **Analyzer** | Select the analyzer used to tokenize and normalize the input text before BM25 scoring. The built-in analyzer splits text on whitespace and punctuation, which suits most English workloads. Choose a custom analyzer if your data needs different tokenization, such as for other languages. See [Choose the Right Analyzer for Your Use Case](choose-the-right-analyzer-for-your-use-case.md). |
    | **Output Field** | Select the `SPARSE_FLOAT_VECTOR` field that stores the BM25 output, for example `vector`. |

    Then click **Save**.

1. Create the collection.

    Review the schema and click **Create**.

</Procedures>
