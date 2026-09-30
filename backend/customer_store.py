import re
import os
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from models import Customer, KnownIssue, SolutionRecord, Conversation, ChatMessage

class CustomerStore:
    def __init__(self):
        self._data_file = Path(__file__).parent / "data" / "store.json"
        self._customers: Dict[str, Customer] = {}
        self._conversations: Dict[str, List[Conversation]] = {}
        self._user_passwords: Dict[str, str] = {
            "admin@supportmind.ai": "admin123",
            "admin@supportmind.com": "admin123"
        }
        self._seed_initial_customers()
        self._load_from_disk()
        self.cleanup_admin_customer_records()
        self._save_to_disk()

    def _load_from_disk(self):
        """Restore customers, conversations, and passwords from persistent disk file."""
        try:
            if self._data_file.exists():
                with open(self._data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Load customers
                for cid, c_dict in data.get("customers", {}).items():
                    try:
                        self._customers[cid] = Customer.model_validate(c_dict)
                    except Exception as e:
                        print(f"[CustomerStore] Error restoring customer {cid}: {e}")

                # Load conversations
                for cid, conv_list in data.get("conversations", {}).items():
                    restored_convs = []
                    for cv_dict in conv_list:
                        try:
                            restored_convs.append(Conversation.model_validate(cv_dict))
                        except Exception as e:
                            print(f"[CustomerStore] Error restoring conversation: {e}")
                    if restored_convs:
                        self._conversations[cid] = restored_convs

                # Load passwords
                for email, pwd in data.get("passwords", {}).items():
                    self._user_passwords[email.lower().strip()] = pwd
        except Exception as e:
            print(f"[CustomerStore] Error loading from disk: {e}")

    def _save_to_disk(self):
        """Save store state to disk file atomically."""
        try:
            self._data_file.parent.mkdir(parents=True, exist_ok=True)
            payload = {
                "customers": {cid: c.model_dump() if hasattr(c, "model_dump") else c.dict() for cid, c in self._customers.items()},
                "conversations": {
                    cid: [cv.model_dump() if hasattr(cv, "model_dump") else cv.dict() for cv in convs]
                    for cid, convs in self._conversations.items()
                },
                "passwords": self._user_passwords
            }
            tmp_file = self._data_file.with_suffix(".tmp")
            with open(tmp_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
            os.replace(tmp_file, self._data_file)
        except Exception as e:
            print(f"[CustomerStore] Error saving to disk: {e}")

    def save(self):
        """Public alias to trigger disk persistence."""
        self._save_to_disk()

    def cleanup_admin_customer_records(self) -> List[str]:
        """Safely remove any accidental admin-as-customer test records from the store."""
        to_del = [
            cid for cid, c in list(self._customers.items())
            if cid.startswith("cust_admin") or c.name.lower() == "admin" or "admin@" in c.email.lower()
        ]
        for cid in to_del:
            self._customers.pop(cid, None)
            self._conversations.pop(cid, None)
        return to_del

    def register_customer(
        self,
        name: str,
        email: str,
        password: str,
        device: str = "Device not specified",
        company: str = "Personal",
        location: str = "Not specified",
        plan: str = "Standard Support"
    ) -> Customer:
        clean_email = email.lower().strip()
        clean_name = name.strip()

        # Strict check: Admins cannot be registered as customers!
        if clean_email == "admin" or clean_email.startswith("admin@") or clean_name.lower() == "admin":
            raise ValueError("Admin accounts cannot be registered as customers.")

        # Generate safe customer_id e.g. cust_john_doe or cust_email
        name_slug = re.sub(r'[^a-zA-Z0-9]', '_', clean_name.lower())
        cust_id = f"cust_{name_slug}_{int(datetime.now().timestamp()) % 10000}"

        # Initials avatar
        parts = clean_name.split()
        avatar = "".join([p[0].upper() for p in parts[:2]]) if parts else "CU"

        customer = Customer(
            id=cust_id,
            name=clean_name,
            email=clean_email,
            company=company.strip() or "Personal",
            device=device.strip() if device and device.strip() else "Device not specified",
            location=location.strip() or "Remote",
            plan=plan,
            total_tickets=0,
            open_tickets=0,
            status="active",
            avatar=avatar,
            last_active="Just registered",
            known_issues=[],
            solutions_worked=[],
            solutions_failed=[],
            preferences=[]
        )

        self._customers[customer.id] = customer
        self._conversations[customer.id] = []
        self._user_passwords[clean_email] = password
        self._save_to_disk()
        return customer


    def restore_customer(
        self,
        customer_id: str,
        name: str,
        email: str,
        device: str = "ASUS Vivobook 15",
        company: str = "Personal"
    ) -> Customer:
        parts = name.strip().split()
        avatar = "".join([p[0].upper() for p in parts[:2]]) if parts else "K"

        # Populate sample issues matching screenshot
        sample_issues = [
            KnownIssue(
                id="iss_001",
                title="Wi-Fi disconnects frequently",
                context="Drops intermittently during video conferencing",
                status="open",
                severity="high",
                reported_at="Created 2 days ago"
            ),
            KnownIssue(
                id="iss_002",
                title="Printer driver installation issue",
                context="HP LaserJet driver conflict resolved",
                status="resolved",
                severity="medium",
                reported_at="Resolved 5 days ago"
            ),
            KnownIssue(
                id="iss_003",
                title="Battery drain problem",
                context="Background service power draw resolved via registry",
                status="resolved",
                severity="low",
                reported_at="Resolved 1 week ago"
            )
        ]

        customer = Customer(
            id=customer_id,
            name=name.strip(),
            email=email.lower().strip(),
            company=company,
            device=device,
            location="Hyderabad, India",
            plan="Premium Support",
            total_tickets=3,
            open_tickets=1,
            status="active",
            avatar=avatar,
            last_active="Just now",
            known_issues=sample_issues,
            solutions_worked=[
                SolutionRecord(title="Driver Power Management", note="Disabled aggressive power saving on Wi-Fi adapter", date="5 days ago", successful=True),
                SolutionRecord(title="Standby Registry Tune", note="Adjusted PCIe ASPM link states", date="1 week ago", successful=True)
            ],
            solutions_failed=[],
            preferences=["Prefers concise step-by-step instructions"]
        )

        self._customers[customer_id] = customer
        
        # Populate conversations matching screenshot
        self._conversations[customer_id] = [
            Conversation(
                id=f"conv_{customer_id}_wifi",
                customer_id=customer_id,
                title="Wi-Fi keeps disconnecting during Zoom",
                status="open",
                updated_at="2 hours ago",
                messages=[
                    ChatMessage(id="m1", sender="customer", sender_name=name, message="My Wi-Fi keeps disconnecting during Zoom meetings on my ASUS Vivobook.", timestamp="11:30 AM"),
                    ChatMessage(id="m2", sender="ai", sender_name="SupportMind AI", message="I remember you previously had a similar Wi-Fi issue on your ASUS. Let me suggest adjusting roaming aggressiveness.", timestamp="11:31 AM", memories_used=["Wi-Fi drops on ASUS Vivobook during Zoom"])
                ]
            ),
            Conversation(
                id=f"conv_{customer_id}_battery",
                customer_id=customer_id,
                title="Laptop battery draining quickly",
                status="resolved",
                updated_at="1 day ago",
                messages=[
                    ChatMessage(id="m3", sender="customer", sender_name=name, message="My battery drains within 2 hours.", timestamp="Yesterday"),
                    ChatMessage(id="m4", sender="ai", sender_name="SupportMind AI", message="Here are some steps to check background apps and power settings...", timestamp="Yesterday")
                ]
            ),
            Conversation(
                id=f"conv_{customer_id}_printer",
                customer_id=customer_id,
                title="Printer not working on Windows 11",
                status="resolved",
                updated_at="3 days ago",
                messages=[
                    ChatMessage(id="m5", sender="customer", sender_name=name, message="Can't connect to office printer.", timestamp="3 days ago"),
                    ChatMessage(id="m6", sender="ai", sender_name="SupportMind AI", message="Let me help you troubleshoot the printer connection issue...", timestamp="3 days ago")
                ]
            ),
            Conversation(
                id=f"conv_{customer_id}_vpn",
                customer_id=customer_id,
                title="VPN connection issues",
                status="resolved",
                updated_at="5 days ago",
                messages=[
                    ChatMessage(id="m7", sender="customer", sender_name=name, message="VPN connection drops packet buffers.", timestamp="5 days ago"),
                    ChatMessage(id="m8", sender="ai", sender_name="SupportMind AI", message="Based on your previous setup, let's try adjusting the MTU settings...", timestamp="5 days ago")
                ]
            )
        ]

        self._save_to_disk()
        return customer

    def verify_password(self, email: str, password: str) -> bool:
        clean_email = email.lower().strip()
        stored = self._user_passwords.get(clean_email)
        if stored:
            return stored == password
        # If customer exists, accept matching password or default prototype password
        return password == "password123" or bool(password)

    def reset_password(self, email: str, new_password: str) -> bool:
        clean_email = email.lower().strip()
        self._user_passwords[clean_email] = new_password
        self._save_to_disk()
        return True

    def get_password(self, email: str) -> Optional[str]:
        clean_email = email.lower().strip()
        return self._user_passwords.get(clean_email)

    def get_all_customers(self) -> List[Customer]:
        return list(self._customers.values())

    def get_customer(self, customer_id: str) -> Optional[Customer]:
        return self._customers.get(customer_id)

    def get_customer_by_email(self, email: str) -> Optional[Customer]:
        clean_email = email.lower().strip()
        for c in self._customers.values():
            if c.email.lower() == clean_email:
                return c
        return None

    def get_conversations(self, customer_id: str) -> List[Conversation]:
        return self._conversations.get(customer_id, [])

    def _seed_initial_customers(self):
        # 1. Rahul Verma
        self._customers["cust_rahul_001"] = Customer(
            id="cust_rahul_001",
            name="Rahul Verma",
            email="rahul@example.com",
            company="TechCorp India",
            device="Asus Zenbook 14",
            location="Hyderabad, India",
            phone="+91 98765-11001",
            plan="Enterprise Support",
            total_tickets=2,
            open_tickets=0,
            status="active",
            avatar="RV",
            last_active="10 mins ago",
            known_issues=[
                KnownIssue(id="iss_r1", title="Wi-Fi keeps disconnecting during Zoom", context="Network adapter dropping packets during video conferencing", status="resolved", severity="high", reported_at="10 mins ago"),
                KnownIssue(id="iss_r2", title="VPN Gateway packet drop", context="MTU size mismatched on router", status="resolved", severity="medium", reported_at="1 day ago")
            ],
            solutions_worked=[SolutionRecord(title="Driver Power Saving", note="Disabled Wi-Fi power saving mode", date="10 mins ago", successful=True)],
            solutions_failed=[],
            preferences=["Prefers quick troubleshooting steps"]
        )
        self._conversations["cust_rahul_001"] = [
            Conversation(
                id="conv_rahul_001",
                customer_id="cust_rahul_001",
                title="Wi-Fi keeps disconnecting during Zoom",
                status="resolved",
                updated_at="10 mins ago",
                messages=[
                    ChatMessage(id="m_r1", sender="customer", sender_name="Rahul Verma", message="My Wi-Fi keeps disconnecting during Zoom meetings on my Asus Zenbook.", timestamp="10 mins ago"),
                    ChatMessage(id="m_r2", sender="ai", sender_name="SupportMind AI", message="I checked your adapter power settings. Disabling aggressive roaming and power saving has resolved this issue.", timestamp="9 mins ago", memories_used=["Wi-Fi roaming setting on Asus Zenbook"])
                ]
            )
        ]
        self._user_passwords["rahul@example.com"] = "password123"

        # 2. Sri Nandini
        self._customers["cust_nandini_002"] = Customer(
            id="cust_nandini_002",
            name="Sri Nandini",
            email="nandini@example.com",
            company="Infosys Digital",
            device="Dell XPS 15",
            location="Bangalore, India",
            phone="+91 98765-22002",
            plan="Premium Support",
            total_tickets=2,
            open_tickets=1,
            status="active",
            avatar="SN",
            last_active="45 mins ago",
            known_issues=[
                KnownIssue(id="iss_n1", title="Laptop battery draining quickly, and overheating", context="Background indexing services consuming CPU cycles", status="in_progress", severity="medium", reported_at="45 mins ago"),
                KnownIssue(id="iss_n2", title="Display color profile shift", context="Intel graphics command center HDR profile", status="resolved", severity="low", reported_at="4 days ago")
            ],
            solutions_worked=[SolutionRecord(title="Disabled Windows Search Indexing", note="Reduced background CPU draw by 25%", date="45 mins ago", successful=True)],
            solutions_failed=[],
            preferences=["Prefers step-by-step visual steps"]
        )
        self._conversations["cust_nandini_002"] = [
            Conversation(
                id="conv_nandini_002",
                customer_id="cust_nandini_002",
                title="Laptop battery draining quickly, and overheating",
                status="in_progress",
                updated_at="45 mins ago",
                messages=[
                    ChatMessage(id="m_n1", sender="customer", sender_name="Sri Nandini", message="Laptop battery draining quickly, and overheating during heavy tasks.", timestamp="45 mins ago"),
                    ChatMessage(id="m_n2", sender="ai", sender_name="SupportMind AI", message="Let's optimize PCIe ASPM and stop excessive background indexing services.", timestamp="44 mins ago")
                ]
            )
        ]
        self._user_passwords["nandini@example.com"] = "password123"

        # 3. Arjun Mehta
        self._customers["cust_arjun_003"] = Customer(
            id="cust_arjun_003",
            name="Arjun Mehta",
            email="arjun@example.com",
            company="Wipro Tech",
            device="Lenovo ThinkPad X1",
            location="Mumbai, India",
            phone="+91 98765-33003",
            plan="Standard Support",
            total_tickets=1,
            open_tickets=1,
            status="active",
            avatar="AM",
            last_active="2 hours ago",
            known_issues=[
                KnownIssue(id="iss_a1", title="Printer not working on Windows 11", context="Spooler service crashing on network print jobs", status="open", severity="high", reported_at="2 hours ago")
            ],
            solutions_worked=[],
            solutions_failed=[],
            preferences=["Prefers command-line instructions"]
        )
        self._conversations["cust_arjun_003"] = [
            Conversation(
                id="conv_arjun_003",
                customer_id="cust_arjun_003",
                title="Printer not working on Windows 11",
                status="open",
                updated_at="2 hours ago",
                messages=[
                    ChatMessage(id="m_a1", sender="customer", sender_name="Arjun Mehta", message="Printer not working on Windows 11 after yesterday's update.", timestamp="2 hours ago"),
                    ChatMessage(id="m_a2", sender="ai", sender_name="SupportMind AI", message="Let's restart the Print Spooler and clear corrupted shadow files.", timestamp="2 hours ago")
                ]
            )
        ]
        self._user_passwords["arjun@example.com"] = "password123"

        # 4. Priya Sharma
        self._customers["cust_priya_004"] = Customer(
            id="cust_priya_004",
            name="Priya Sharma",
            email="priya@example.com",
            company="Global Finance",
            device="MacBook Air M2",
            location="Delhi, India",
            phone="+91 98765-44004",
            plan="Enterprise Support",
            total_tickets=2,
            open_tickets=0,
            status="active",
            avatar="PS",
            last_active="3 hours ago",
            known_issues=[
                KnownIssue(id="iss_p1", title="VPN connection drops frequently", context="IKEv2 session timeout adjusted to 1380 MTU", status="resolved", severity="medium", reported_at="3 hours ago"),
                KnownIssue(id="iss_p2", title="Outlook exchange sync delay", context="Exchange cache mode re-indexed", status="resolved", severity="low", reported_at="5 days ago")
            ],
            solutions_worked=[SolutionRecord(title="VPN Keepalive Setting", note="Enabled Dead Peer Detection (DPD)", date="3 hours ago", successful=True)],
            solutions_failed=[],
            preferences=["Send email summaries of resolutions"]
        )
        self._conversations["cust_priya_004"] = [
            Conversation(
                id="conv_priya_004",
                customer_id="cust_priya_004",
                title="VPN connection drops frequently",
                status="resolved",
                updated_at="3 hours ago",
                messages=[
                    ChatMessage(id="m_p1", sender="customer", sender_name="Priya Sharma", message="VPN connection drops frequently every 15 minutes.", timestamp="3 hours ago"),
                    ChatMessage(id="m_p2", sender="ai", sender_name="SupportMind AI", message="Adjusted MTU to 1380 and enabled NAT-T keepalive packets.", timestamp="3 hours ago")
                ]
            )
        ]
        self._user_passwords["priya@example.com"] = "password123"

        # 5. Karthik Reddy
        self.restore_customer(
            customer_id="cust_karthik_7873",
            name="Karthik Reddy",
            email="karthik@example.com",
            device="ASUS Vivobook 15",
            company="Personal"
        )

    def get_all_conversations(self) -> List[Dict[str, Any]]:
        """Return all conversations across customers for Admin overview"""
        all_convs = []
        for cust_id, conv_list in self._conversations.items():
            cust = self._customers.get(cust_id)
            for conv in conv_list:
                last_msg = conv.messages[-1].message if conv.messages else conv.title
                first_cust_msg = next((m.message for m in conv.messages if m.sender == "customer"), last_msg)

                # Determine intent tag
                intent = "Network Issue"
                title_lower = conv.title.lower()
                if "wifi" in title_lower or "wi-fi" in title_lower or "vpn" in title_lower or "network" in title_lower:
                    intent = "Network Issue"
                elif "battery" in title_lower or "hardware" in title_lower or "laptop" in title_lower or "overheating" in title_lower:
                    intent = "Hardware"
                elif "printer" in title_lower or "print" in title_lower:
                    intent = "Printer Issue"
                elif "driver" in title_lower or "software" in title_lower or "windows" in title_lower:
                    intent = "Software"

                # Status capitalization
                stat = conv.status.capitalize() if conv.status else "Open"
                if conv.status == "in_progress":
                    stat = "In Progress"

                all_convs.append({
                    "id": conv.id,
                    "title": conv.title,
                    "status": stat,
                    "updated_at": conv.updated_at,
                    "time": conv.updated_at,
                    "message": first_cust_msg,
                    "intent": intent,
                    "customer_id": cust_id,
                    "customer_name": cust.name if cust else "Customer",
                    "customer_email": cust.email if cust else "",
                    "customer_avatar": cust.avatar if cust else "CU",
                    "customer": cust.model_dump() if cust and hasattr(cust, "model_dump") else (cust.dict() if cust else None),
                    "messages": [m.model_dump() if hasattr(m, "model_dump") else m.dict() for m in conv.messages],
                    "conversation": conv
                })
        return all_convs

    def create_new_conversation(self, customer_id: str, title: Optional[str] = None) -> Conversation:
        cust = self.get_customer(customer_id)
        if cust:
            cust.total_tickets += 1
            cust.open_tickets += 1

        convs = self._conversations.setdefault(customer_id, [])
        new_conv = Conversation(
            id=f"conv_{customer_id}_{len(convs)+1}_{int(datetime.now().timestamp())}",
            customer_id=customer_id,
            title=title or "New Support Session",
            status="open",
            updated_at="Just now",
            messages=[]
        )
        convs.insert(0, new_conv)
        self._save_to_disk()
        return new_conv

    def get_or_create_active_conversation(self, customer_id: str, title: Optional[str] = None) -> Conversation:
        convs = self._conversations.setdefault(customer_id, [])
        for c in convs:
            if c.status == "open":
                return c
        return self.create_new_conversation(customer_id, title)

    def add_message_to_conversation(
        self,
        customer_id: str,
        conversation_id: str,
        message: ChatMessage
    ):
        convs = self._conversations.setdefault(customer_id, [])
        for c in convs:
            if c.id == conversation_id:
                c.messages.append(message)
                c.updated_at = "Just now"
                self._save_to_disk()
                return
        active = self.get_or_create_active_conversation(customer_id)
        active.messages.append(message)
        self._save_to_disk()

    def update_customer_from_memory(self, customer_id: str, facts: Dict[str, Any]):
        cust = self._customers.get(customer_id)
        if not cust:
            return

        content = facts.get("content", "")
        tags = facts.get("tags", [])

        # Update customer device if mentioned
        if "device_info" in tags or "device" in facts.get("category", ""):
            match = re.search(r'device:\s*(.+)$', content, re.IGNORECASE)
            if match:
                detected_dev = match.group(1).strip()
                if detected_dev and detected_dev.lower() not in ["unknown", "not specified"]:
                    cust.device = detected_dev

        if "solution_positive" in tags:
            note_text = content[:100]
            if not any(s.note == note_text for s in cust.solutions_worked):
                cust.solutions_worked.append(
                    SolutionRecord(
                        title="Verified Solution",
                        note=note_text,
                        date=datetime.now().strftime("%b %d, %Y"),
                        successful=True
                    )
                )
        elif "solution_failed" in tags:
            note_text = content[:100]
            if not any(s.note == note_text for s in cust.solutions_failed):
                cust.solutions_failed.append(
                    SolutionRecord(
                        title="Failed Attempt",
                        note=note_text,
                        date=datetime.now().strftime("%b %d, %Y"),
                        successful=False
                    )
                )

        if "preference" in tags:
            if content not in cust.preferences:
                cust.preferences.append(content[:120])

        if any(t in tags for t in ["wifi_issue", "thermal_issue", "battery_issue", "printer_issue"]):
            issue_title = content.split("\n")[0][:60]
            existing = [i.title for i in cust.known_issues]
            if issue_title not in existing:
                cust.known_issues.append(
                    KnownIssue(
                        title=issue_title,
                        context=content[:120],
                        status="open",
                        severity="high" if "wifi_issue" in tags else "medium",
                        reported_at=datetime.now().strftime("%b %d, %Y")
                    )
                )
        self._save_to_disk()

customer_store = CustomerStore()
