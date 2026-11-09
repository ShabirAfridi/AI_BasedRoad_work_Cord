package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.ComplaintCategorizationResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.DelayPredictionResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.RoadSegment;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.WorkType;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalyticsService {
    private final ChatClient chatClient;
    private final Workrequestrepository workrequestrepository;
    /*

     */
    public DelayPredictionResponse predictDelay(
            WorkType workType,int plannedDurationDays ,int priority
    ){
        String prompt = """
                A Department has Submitted a road excavation request with:
                - work type : %s
                - planned duration: %d days
                - Priority: %s
                
                Based on typical excavation project patterns in Pakistan,
                                estimate how many actual days this work will likely take
                                (accounting for common delays like weather, equipment
                                availability, and bureaucratic approval time), assign a
                                risk level, and give one-sentence reasoning.
                                
                                 Respond ONLY in this exact JSON structure:
                                                {
                                                  "estimatedDays": <number>,
                                                  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
                                                  "reasoning": "<one sentence>"
                                                }""".formatted(
                                                        workType.name().replace("_",""),
                plannedDurationDays,
                priority == 1 ? "HIGH": priority == 2 ? "NORMAL " : "LOW"

        );
        try {
            DelayPredictionResponse result = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .entity(DelayPredictionResponse.class);
            log.info("Delay prediction generated: {} days, risk={}",
                    result.estimatedDays(),result.riskLevel());
            return result;

        }catch (Exception e){
            log.info("AI delay prediction failed - falling back to default: {}",e.getMessage());
            return new DelayPredictionResponse(
                    plannedDurationDays ," MEDIUM",
                    "AI prediction unavailable — showing planned duration as-is"
            );
        }
    }
    public String recommendSchedule(RoadSegment roadSegment, LocalDate earliestStart){
        List<String> existingBooking = workrequestrepository
                .findActiveBySegment(roadSegment.getId())
                .stream()
                .map(w -> w.getStartDate() + "to" + w.getEndDate()
                +"("+w.getDepartment().getName() + ")").toList();

        String bookingsText = existingBooking .isEmpty()
                ?"NO existing booking on this road segment"
                : String.join("\n",existingBooking);
        String prompt = """
                Road Segment: %s
                earliest possible Start date requested: %s
                Existing work already scheduled on this road: %s
                
                
                Suggest the best available date range for a new excavation
                                request that avoids overlapping with the existing bookings
                                above. Keep your answer to 2-3 sentences, plain text, no JSON.
                                
                """.formatted(roadSegment.getName(),earliestStart,bookingsText);
        try{
            String recommendation = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();
            log.info("Scheduled recommendation generated for segment {} ",roadSegment.getName());
            return recommendation;
        }catch (Exception e ){
            log.error("AI scheduling recommendation is failed: {} ",e.getMessage());
            return "AI recommendation is unavailable. please review the road segment's "
                    + "existing schedule manually before choosing dates ";
        }
    }
    public ComplaintCategorizationResponse categorizeComplaint( String description ){
        String prompt = """
                A citizen submitted this complaint about road excavation work:
                "%s"
 
                Classify it into exactly one category, assign an urgency
                level, and write a one-sentence summary for the admin.
 
                Categories (choose exactly one):
                ILLEGAL_DIGGING, ROAD_DAMAGE, DELAY, NOISE_OR_DISRUPTION, OTHER
 
                Respond ONLY in this exact JSON structure:
                {
                  "category": "<one of the categories above>",
                  "urgency": "LOW" | "MEDIUM" | "HIGH",
                  "summary": "<one sentence>"
                }
                """.formatted(description);
        try{
            ComplaintCategorizationResponse result = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .entity(ComplaintCategorizationResponse.class);
                    log.info("Complaint Categorized as {} (urgency={})",
                            result.category(),result.urgency());
                            return result;
        }catch (Exception e){
            log.error("AI complaint categorization failed: {}", e.getMessage());
            return new ComplaintCategorizationResponse(
                    "OTHER","MEDIUM",
                    "AI categorization unavailable — please review manually."
            );
        }
    }
}
