package handlers

import (
	"encoding/json"

	"github.com/exponat/logistics/internal/models"
)

func shallowMergeExhibit(prev models.Exhibit, patchJSON []byte) (models.Exhibit, error) {
	base, err := json.Marshal(prev)
	if err != nil {
		return prev, err
	}
	var a, b map[string]any
	if err := json.Unmarshal(base, &a); err != nil {
		return prev, err
	}
	if err := json.Unmarshal(patchJSON, &b); err != nil {
		return prev, err
	}
	for k, v := range b {
		a[k] = v
	}
	a["id"] = prev.ID
	a["organizationId"] = prev.OrganizationID
	if _, ok := a["createdAt"]; !ok || a["createdAt"] == nil || a["createdAt"] == "" {
		a["createdAt"] = prev.CreatedAt
	}
	if _, ok := a["createdBy"]; !ok || a["createdBy"] == nil || a["createdBy"] == "" {
		a["createdBy"] = prev.CreatedBy
	}
	out, err := json.Marshal(a)
	if err != nil {
		return prev, err
	}
	var merged models.Exhibit
	if err := json.Unmarshal(out, &merged); err != nil {
		return prev, err
	}
	return merged, nil
}

func shallowMergeShipment(prev models.Shipment, patchJSON []byte) (models.Shipment, error) {
	base, err := json.Marshal(prev)
	if err != nil {
		return prev, err
	}
	var a, b map[string]any
	if err := json.Unmarshal(base, &a); err != nil {
		return prev, err
	}
	if err := json.Unmarshal(patchJSON, &b); err != nil {
		return prev, err
	}
	for k, v := range b {
		a[k] = v
	}
	a["id"] = prev.ID
	a["organizationId"] = prev.OrganizationID
	if _, ok := a["createdAt"]; !ok || a["createdAt"] == nil || a["createdAt"] == "" {
		a["createdAt"] = prev.CreatedAt
	}
	if _, ok := a["createdBy"]; !ok || a["createdBy"] == nil || a["createdBy"] == "" {
		a["createdBy"] = prev.CreatedBy
	}
	out, err := json.Marshal(a)
	if err != nil {
		return prev, err
	}
	var merged models.Shipment
	if err := json.Unmarshal(out, &merged); err != nil {
		return prev, err
	}
	return merged, nil
}
