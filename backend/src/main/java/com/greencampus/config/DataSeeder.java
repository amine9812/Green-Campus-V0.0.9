package com.greencampus.config;

import com.greencampus.model.Asset;
import com.greencampus.model.Room;
import com.greencampus.model.Ticket;
import com.greencampus.model.Session;
import com.greencampus.model.User;
import com.greencampus.model.enums.*;
import com.greencampus.repository.RoomRepository;
import com.greencampus.repository.TicketRepository;
import com.greencampus.repository.SessionRepository;
import com.greencampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

        private final RoomRepository roomRepository;
        private final TicketRepository ticketRepository;
        private final SessionRepository sessionRepository;
        private final UserRepository userRepository;

        @Override
        @Transactional
        public void run(String... args) {
                if (roomRepository.count() > 0) {
                        log.info("Seed data already present — skipping.");
                        return;
                }
                log.info("Seeding initial room data...");

                // ── Room A1: Classroom with 6 tables, PCs ──
                Room a1 = Room.builder()
                                .code("A1")
                                .type(RoomType.CLASS)
                                .capacity(30)
                                .status(RoomStatus.OPEN)
                                .totalTables(6)
                                .tablesHavePcs(true)
                                .notes("Ground floor classroom, building A.")
                                .assets(new ArrayList<>())
                                .build();
                addDefaultAssets(a1);
                addTablePcs(a1, 6, List.of()); // all working

                // ── Room LAB-A1: Lab with 10 tables, PCs (some broken) ──
                Room labA1 = Room.builder()
                                .code("LAB-A1")
                                .type(RoomType.LAB)
                                .capacity(40)
                                .status(RoomStatus.OPEN)
                                .totalTables(10)
                                .tablesHavePcs(true)
                                .notes("Computer lab, building A, first floor. Specialized software installed.")
                                .assets(new ArrayList<>())
                                .build();
                addDefaultAssets(labA1);
                addTablePcs(labA1, 10, List.of(3, 7, 8)); // PCs 3, 7, 8 are broken

                // ── Room AMPHI-01: Amphitheatre, no PCs ──
                Room amphi01 = Room.builder()
                                .code("AMPHI-01")
                                .type(RoomType.AMPHI)
                                .capacity(200)
                                .status(RoomStatus.OPEN)
                                .totalTables(0)
                                .tablesHavePcs(false)
                                .notes("Main amphitheatre, 200 seats, ground floor.")
                                .assets(new ArrayList<>())
                                .build();
                addDefaultAssets(amphi01);

                // ── Room B2: Classroom, closed for maintenance ──
                Room b2 = Room.builder()
                                .code("B2")
                                .type(RoomType.CLASS)
                                .capacity(25)
                                .status(RoomStatus.CLOSED)
                                .totalTables(5)
                                .tablesHavePcs(true)
                                .notes("Closed for electrical maintenance until March.")
                                .assets(new ArrayList<>())
                                .build();
                addDefaultAssets(b2);
                // Mark projector broken
                b2.getAssets().stream()
                                .filter(a -> a.getType() == AssetType.PROJECTOR)
                                .findFirst().ifPresent(a -> a.setStatus(AssetStatus.BROKEN));
                addTablePcs(b2, 5, List.of(2, 4));

                // ── Room LAB-B1: Another lab ──
                Room labB1 = Room.builder()
                                .code("LAB-B1")
                                .type(RoomType.LAB)
                                .capacity(30)
                                .status(RoomStatus.OPEN)
                                .totalTables(8)
                                .tablesHavePcs(true)
                                .notes("Physics lab, building B.")
                                .assets(new ArrayList<>())
                                .build();
                addDefaultAssets(labB1);
                addTablePcs(labB1, 8, List.of(5));

                roomRepository.saveAll(List.of(a1, labA1, amphi01, b2, labB1));
                log.info("Seeded {} rooms with assets.", 5);

                // ── Seed tickets ──
                ticketRepository.saveAll(List.of(
                                Ticket.builder().room(labA1).title("PC-03 unresponsive after update")
                                                .description("Workstation 3 freezes during boot. Needs hardware check.")
                                                .priority(TicketPriority.P1).status(TicketStatus.OPEN).build(),
                                Ticket.builder().room(labA1).title("Software license expired on PC-07")
                                                .description("AutoCAD license needs renewal.")
                                                .priority(TicketPriority.P2).status(TicketStatus.IN_PROGRESS).build(),
                                Ticket.builder().room(b2).title("Electrical wiring inspection")
                                                .description("Full inspection required before re-opening.")
                                                .priority(TicketPriority.P1).status(TicketStatus.OPEN).build(),
                                Ticket.builder().room(b2).title("Projector bulb replacement")
                                                .description("Projector showing dim output, bulb needs replacement.")
                                                .priority(TicketPriority.P2).status(TicketStatus.OPEN).build(),
                                Ticket.builder().room(labB1).title("Whiteboard markers running low")
                                                .description("Need to restock markers for the physics lab.")
                                                .priority(TicketPriority.P3).status(TicketStatus.OPEN).build()));
                log.info("Seeded {} tickets.", 5);

                // ── Seed sessions ──
                sessionRepository.saveAll(List.of(
                                Session.builder().room(a1).courseName("Mathematics I").teacherName("Dr. Martin")
                                                .dayOfWeek(DayOfWeekEnum.MONDAY).startTime(LocalTime.of(8, 0))
                                                .endTime(LocalTime.of(10, 0)).groupName("G1-CS").build(),
                                Session.builder().room(a1).courseName("Physics Lab").teacherName("Prof. Laurent")
                                                .dayOfWeek(DayOfWeekEnum.MONDAY).startTime(LocalTime.of(10, 15))
                                                .endTime(LocalTime.of(12, 15)).groupName("G2-EE").build(),
                                Session.builder().room(a1).courseName("English").teacherName("Ms. Davis")
                                                .dayOfWeek(DayOfWeekEnum.TUESDAY).startTime(LocalTime.of(14, 0))
                                                .endTime(LocalTime.of(16, 0)).groupName("G1-CS").build(),
                                Session.builder().room(labA1).courseName("Database Systems").teacherName("Dr. Chen")
                                                .dayOfWeek(DayOfWeekEnum.MONDAY).startTime(LocalTime.of(8, 0))
                                                .endTime(LocalTime.of(10, 0)).groupName("G1-CS").build(),
                                Session.builder().room(labA1).courseName("Operating Systems")
                                                .teacherName("Prof. Moreau")
                                                .dayOfWeek(DayOfWeekEnum.WEDNESDAY).startTime(LocalTime.of(10, 15))
                                                .endTime(LocalTime.of(12, 15)).groupName("G2-CS").build(),
                                Session.builder().room(labA1).courseName("Algorithms").teacherName("Dr. Martin")
                                                .dayOfWeek(DayOfWeekEnum.THURSDAY).startTime(LocalTime.of(8, 0))
                                                .endTime(LocalTime.of(10, 0)).groupName("G1-CS").build(),
                                Session.builder().room(amphi01).courseName("General Physics")
                                                .teacherName("Prof. Laurent")
                                                .dayOfWeek(DayOfWeekEnum.TUESDAY).startTime(LocalTime.of(8, 0))
                                                .endTime(LocalTime.of(10, 0)).groupName("All-1st-Year").build(),
                                Session.builder().room(amphi01).courseName("Intro to CS").teacherName("Dr. Chen")
                                                .dayOfWeek(DayOfWeekEnum.THURSDAY).startTime(LocalTime.of(14, 0))
                                                .endTime(LocalTime.of(16, 0)).groupName("All-1st-Year").build(),
                                Session.builder().room(labB1).courseName("Electronics Lab").teacherName("Dr. Petit")
                                                .dayOfWeek(DayOfWeekEnum.FRIDAY).startTime(LocalTime.of(8, 0))
                                                .endTime(LocalTime.of(12, 0)).groupName("G1-EE").build()));
                log.info("Seeded {} sessions.", 9);

                // ── Seed users ──
                userRepository.saveAll(List.of(
                                User.builder().username("admin").passwordHash(sha256("admin123"))
                                                .displayName("Admin User").role(UserRole.ADMIN).build(),
                                User.builder().username("tech").passwordHash(sha256("tech123"))
                                                .displayName("Tech Support").role(UserRole.TECHNICIAN).build(),
                                User.builder().username("staff").passwordHash(sha256("staff123"))
                                                .displayName("Teaching Staff").role(UserRole.STAFF).build()));
                log.info("Seeded 3 users.");
        }

        private void addDefaultAssets(Room room) {
                Asset projector = Asset.builder()
                                .room(room)
                                .type(AssetType.PROJECTOR)
                                .label("Projector")
                                .status(AssetStatus.WORKING)
                                .build();
                Asset teacherPc = Asset.builder()
                                .room(room)
                                .type(AssetType.TEACHER_PC)
                                .label("Teacher PC")
                                .status(AssetStatus.WORKING)
                                .build();
                room.getAssets().add(projector);
                room.getAssets().add(teacherPc);
        }

        private void addTablePcs(Room room, int count, List<Integer> brokenIndices) {
                for (int i = 1; i <= count; i++) {
                        Asset pc = Asset.builder()
                                        .room(room)
                                        .type(AssetType.TABLE_PC)
                                        .label("PC-" + String.format("%02d", i))
                                        .status(brokenIndices.contains(i) ? AssetStatus.BROKEN : AssetStatus.WORKING)
                                        .tableIndex(i)
                                        .build();
                        room.getAssets().add(pc);
                }
        }

        private String sha256(String input) {
                try {
                        MessageDigest md = MessageDigest.getInstance("SHA-256");
                        byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
                        StringBuilder sb = new StringBuilder();
                        for (byte b : hash)
                                sb.append(String.format("%02x", b));
                        return sb.toString();
                } catch (Exception e) {
                        throw new RuntimeException(e);
                }
        }
}
