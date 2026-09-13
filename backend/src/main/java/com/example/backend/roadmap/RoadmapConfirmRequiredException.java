package com.example.backend.roadmap;

import com.example.backend.roadmap.dto.RoadmapSummary;

import java.util.List;

public class RoadmapConfirmRequiredException extends RuntimeException {

    private final String reason;
    private final Long willReplaceCareerId;
    private final String willReplaceCareerName;
    private final List<RoadmapSummary> existing;

    public RoadmapConfirmRequiredException(
            String message,
            String reason,
            Long willReplaceCareerId,
            String willReplaceCareerName,
            List<RoadmapSummary> existing
    ) {
        super(message);
        this.reason = reason;
        this.willReplaceCareerId = willReplaceCareerId;
        this.willReplaceCareerName = willReplaceCareerName;
        this.existing = existing;
    }

    public String getReason() {
        return reason;
    }

    public Long getWillReplaceCareerId() {
        return willReplaceCareerId;
    }

    public String getWillReplaceCareerName() {
        return willReplaceCareerName;
    }

    public List<RoadmapSummary> getExisting() {
        return existing;
    }
}
