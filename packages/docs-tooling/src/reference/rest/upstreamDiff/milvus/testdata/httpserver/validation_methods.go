package httpserver

import "fmt"

// Validation methods live here on purpose: the extractor must collect them
// in a second pass even though their structs are declared in another file
// of the same package (two-phase collection).

// toProto mirrors the upstream's request validation methods: the extractor
// records its field-scoped error literals verbatim as grounding evidence.
// The second literal mentions no CreateCollectionReq field, so it must stay
// out of the skeleton ("collectionname" is a field, "collection must" is
// not a word-boundary match for it).
func (r *CreateCollectionReq) toProto() error {
	if r.Dimension != nil && *r.Dimension <= 0 {
		return fmt.Errorf("quickSetup dimension must be greater than 0")
	}
	return fmt.Errorf("collection must exist")
}

// validate mirrors the upstream's VALUE-receiver validation methods: the
// extractor collects pointer and value receivers identically.
func (r JobIDReq) validate() error {
	if len(r.JobID) == 0 {
		return fmt.Errorf("jobId is required for the job")
	}
	return nil
}
