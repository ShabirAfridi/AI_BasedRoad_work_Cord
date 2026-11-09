package com.UNI_FYP.AI_Based_Road_Construction;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.UNI_FYP.AI_Based_Road_Construction.dto.WorkRequestRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.WorkType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test — spins up the REAL Spring app (in a test context)
 * and sends REAL HTTP requests through MockMvc, then checks the REAL
 * response. This is different from the unit test we did before:
 * here nothing is faked — Controller, Service, and Repository all
 * actually run together, just against an in-memory/test setup
 * instead of hitting your real production database.
 *
 * Only 3 tests here on purpose — small and readable.
 */
@SpringBootTest
@AutoConfigureMockMvc
class WorkRequestControllerTest {

    // MockMvc lets us "pretend" to be Postman — it builds a fake
    // HTTP request and sends it into your app, then gives back
    // a real response we can check.
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // converts Java objects <-> JSON

    // ─────────────────────────────────────────────────────────────
    // TEST 1 — no token at all → must be blocked
    // ─────────────────────────────────────────────────────────────
    @Test
    void getWorkRequests_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/work-requests"))
                .andExpect(status().isForbidden());
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2 — logged in as DEPARTMENT_USER → allowed, gets 200
    //
    // @WithMockUser fakes a logged-in user WITHOUT needing a real
    // JWT token or a real login call. It just tells Spring Security
    // "pretend someone with this role is logged in" for this test only.
    // ─────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(roles = "DEPARTMENT_USER")
    void getWorkRequests_asDepartmentUser_returns200() throws Exception {
        mockMvc.perform(get("/api/work-requests"))
                .andExpect(status().isOk());
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3 — submitting with an invalid body (missing required
    // fields) must return 400, proving @Valid validation works
    // end-to-end through the real controller.
    // ─────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(roles = "DEPARTMENT_USER")
    void submitWorkRequest_withMissingFields_returns400() throws Exception {

        // Deliberately incomplete — no roadSegmentId, no dates
        WorkRequestRequest badRequest = WorkRequestRequest.builder()
                .workType(WorkType.WATER_PIPE)
                .build();

        mockMvc.perform(post("/api/work-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest());
    }
}