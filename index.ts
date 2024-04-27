interface IFeedback {
    feedbackId: string; // Mã phản hồi
    score: number; // Điểm đánh giá
    content: string; // Nội dung phản hồi
}

class Feedback implements IFeedback {
    feedbackId: string; 
    score: number; 
    content: string; 

    private scoreActive: number;
    private listFeedback: IFeedback[];
    private feedbackInput: HTMLInputElement;
    private error: HTMLElement;
    private btnSend: HTMLElement;
    private reviewNumber: HTMLElement;
    private averageRate: HTMLElement;
    private inputContainer: HTMLElement;
    private updatingFeedbackId: string; 

    constructor() {
        this.feedbackId = getID(); 
        this.score = 0; 
        this.content = ""; 

        this.scoreActive = 10; 
        this.listFeedback = JSON.parse(localStorage.getItem("feedbacks") || "[]"); // Lấy các phản hồi từ localStorage
        this.feedbackInput = document.querySelector("#feedbackInput") as HTMLInputElement; // Input phản hồi
        this.error = document.querySelector(".error") as HTMLElement; // Hiển thị thông báo lỗi
        this.btnSend = document.querySelector(".btn-send") as HTMLElement; // Nút gửi phản hồi
        this.reviewNumber = document.querySelector(".review-number") as HTMLElement; // Số lượng phản hồi
        this.averageRate = document.querySelector(".average-number") as HTMLElement; // Điểm đánh giá trung bình
        this.inputContainer = document.querySelector(".input-container") as HTMLElement; // Phần container của input

        this.inputContainer.addEventListener("click", () => {
            this.feedbackInput.focus();
        });

        this.feedbackInput.focus();

        this.renderListButtonScore();

        this.handleScoreButtonClick();

        this.renderListFeedback();

        this.validateData();

        this.handleAverageRating();

        this.handleSendButtonClick();
    }

    private renderListButtonScore(): void {
        let scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
        let btnScoreGroup = document.querySelector(".btn-score-group") as HTMLElement; 

        let scoreHtmls = scores.map((score) => {
            return `
                <button class="btn-score ${score === this.scoreActive ? "active" : ""}" data-score="${score}">${score}</button>
            `;
        });
        
        btnScoreGroup.innerHTML = scoreHtmls.join("");
    }

    private handleScoreButtonClick(): void {
        const btnScoreGroup = document.querySelector(".btn-score-group") as HTMLElement;
    
        btnScoreGroup.addEventListener("click", (e) => {
            const targetButton = (e.target as HTMLElement).closest(".btn-score") as HTMLElement;
            if (targetButton) {
                const allButtons = btnScoreGroup.querySelectorAll(".btn-score");
                allButtons.forEach((button) => button.classList.remove("active"));
                targetButton.classList.add("active");
                const score = targetButton.dataset.score;
                if (score !== undefined) {
                    this.scoreActive = +score;
                }
            }
        });
    }

    // Render danh sách các phản hồi
    private renderListFeedback(): void {
        let listFeedbackContent = document.querySelector(".list-feedback-content") as HTMLElement;

        let feedbackHtmls = this.listFeedback.map((feedback) => {
            return `
                <div class="feedback-content">
                    <div class="feedback-content-header">
                        <i id="update_${feedback.feedbackId}" class="fa-solid fa-pen-to-square"></i>
                        <i id="delete_${feedback.feedbackId}" class="fa-solid fa-xmark"></i>
                    </div>
                    <div class="feedback-content-body">
                        <p class="content-feedback">${feedback.content}</p>
                    </div>
                    <button class="btn-score active">${feedback.score}</button>
                </div>
            `;
        });

        let feedbackHtml = feedbackHtmls.join("");

        listFeedbackContent.innerHTML = feedbackHtml;

        this.reviewNumber.innerHTML = this.listFeedback.length.toString();
        this.handleDeleteFeedback(); 
        this.handleUpdateFeedback(); 
    }

    // Xử lý sự kiện khi click vào nút xóa phản hồi
    private handleDeleteFeedback(): void {
        let listFeedbackContent = document.querySelector(".list-feedback-content") as HTMLElement;
    
        listFeedbackContent.addEventListener("click", (e) => {
            const deleteButton = (e.target as HTMLElement).closest(".fa-xmark");
            if (deleteButton) {
                Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ff0000",
                    cancelButtonColor: "##fc0303",
                    confirmButtonText: "Yes, delete it!"
                }).then((result) => {
                    if (result.isConfirmed) {
                        const idDelete = deleteButton.id.split("_")[1];
    
                        this.listFeedback = this.listFeedback.filter(
                            (fb) => fb.feedbackId !== idDelete
                        );
    
                        localStorage.setItem("feedbacks", JSON.stringify(this.listFeedback));
    
                        this.renderListFeedback();
                        this.handleAverageRating();
                    }
                });
            }
        });
    }

    private handleUpdateFeedback(): void {
        let listFeedbackContent = document.querySelector(".list-feedback-content") as HTMLElement;

        listFeedbackContent.addEventListener("click", (e) => {
            if (e.target && (e.target as HTMLElement).matches(".fa-pen-to-square")) {
                let idUpdate = (e.target as HTMLElement).id.split("_")[1];
                let updatingFeedback = this.listFeedback.find(
                    (fb) => fb.feedbackId === idUpdate
                );

                if (updatingFeedback) {
                    this.feedbackInput.value = updatingFeedback.content;
                    this.scoreActive = updatingFeedback.score;

                    this.renderListButtonScore();

                    this.updatingFeedbackId = idUpdate;

                    this.btnSend.textContent = "Lưu lại";
                }
            }
        });
    }

    private handleSendButtonClick(): void {
        this.btnSend.addEventListener("click", (e) => {
            e.stopPropagation();
            let feedback = this.feedbackInput.value;

            if (this.updatingFeedbackId) {
                let updatingFeedback = this.listFeedback.find(
                    (fb) => fb.feedbackId === this.updatingFeedbackId
                );

                if (updatingFeedback) {
                    updatingFeedback.content = feedback;
                    updatingFeedback.score = this.scoreActive;
    
                    localStorage.setItem("feedbacks", JSON.stringify(this.listFeedback));
    
                    this.feedbackInput.value = "";
                    this.renderListFeedback();
                    this.handleAverageRating();
                    this.reviewNumber.innerHTML = this.listFeedback.length.toString();
                    this.btnSend.textContent = "Gửi";
                    this.updatingFeedbackId = ""; 
                }
            } else { 
                let newFeedback: IFeedback = {
                    feedbackId: getID().toString(),
                    score: this.scoreActive,
                    content: feedback,
                };
                this.listFeedback.push(newFeedback);
    
                localStorage.setItem("feedbacks", JSON.stringify(this.listFeedback));
    
                this.feedbackInput.value = "";
                this.renderListFeedback();
                this.handleAverageRating();
                this.reviewNumber.innerHTML = this.listFeedback.length.toString();
            }
        });
    }

    // Validate dữ liệu nhập vào
    private validateData(): void {
        this.feedbackInput.addEventListener("input", () => {
            const feedback = this.feedbackInput.value.trim();
            if (feedback.length < 10) {
                this.error.style.display = "block";
                this.btnSend.classList.remove("btn-dark");
            } else {
                this.error.style.display = "none";
                this.btnSend.classList.add("btn-dark");
            }
        });
    }

    private handleAverageRating(): void {
        if (this.listFeedback.length > 0) {
            let totalScoreFeedback = this.listFeedback.reduce((a, b) => {
                return a + b.score;
            }, 0);

            let averageRating = totalScoreFeedback / this.listFeedback.length;
            this.averageRate.innerHTML = averageRating.toFixed(1);
        } else {
            this.averageRate.innerHTML = "0";
        }
    }
}


new Feedback();


function getID(): string { 
    return (Math.floor(100000 + Math.random() * 900000)).toString();
}
