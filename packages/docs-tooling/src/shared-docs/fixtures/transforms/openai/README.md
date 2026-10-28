# WP10 OpenAI assertion inputs

`real-python.md` copies the retained OpenAI pilot byte-for-byte, adding only the
start/end markers around its existing embedding-function fence. The test removes
those markers and compares the bytes with the pilot on every run.

`synthetic-multilanguage.md` is synthetic Python, Java and C++ credential code.
It exercises the Java builder form and the `cpp`/`c++` alias. These are assertion
inputs, not approved C3 content or golden outputs. Multi-language replace/add,
ambiguous and missing selectors, overlong selectors, parent/child conflicts,
indentation and changed-upstream rejection use this synthetic fixture. The real
Python fence also exercises replace/add and unchanged Milvus preprocessing.
Real multi-language evidence remains a C3 content-alignment follow-up.
