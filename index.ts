// import Swal from "sweetalert2";

interface IFeedback {
    feedbackId: string;
    score: number
    content: string
}


class Feedback implements IFeedback {
    feedbackId: string
    score: number
    content: string
    private scoreActive: number;
    private listFeedback: IFeedback[];
    private feedbackInput: HTMLInputElement;
    private error: HTMLElement;
    private btnSend: HTMLElement;
    private reviewNumber: HTMLElement;
    private averageRate: HTMLElement;
    private inputContainer: HTMLElement;

    constructor() {
        this.feedbackId = uuidv4();
        this.score = 0;
        this.content = "";

        this.scoreActive = 10;
        this.listFeedback = JSON.parse(localStorage.getItem("feedbacks") || "[]");
        this.feedbackInput = document.querySelector("#feedbackInput") as HTMLInputElement;
        this.error = document.querySelector(".error") as HTMLElement;
        this.btnSend = document.querySelector(".btn-send") as HTMLElement;
        this.reviewNumber = document.querySelector(".review-number") as HTMLElement;
        this.averageRate = document.querySelector(".average-number") as HTMLElement;
        this.inputContainer = document.querySelector(".input-container") as HTMLElement;

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
        let scroses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let btnScoreGroup = document.querySelector(".btn-score-group") as HTMLElement;

        let scoreHtmls = scroses.map((score) => {
            return `
                <button class="btn-score ${score === this.scoreActive ? "active" : ""}" data-score="${score}">${score}</button>
            `;
        });
        
        let scroreHtml = scoreHtmls.join("");

        btnScoreGroup.innerHTML = scroreHtml;
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
                }
            }
        });
    }
    
    private handleSendButtonClick(): void {
        this.btnSend.addEventListener("click", (e) => {

           
                    e.stopPropagation();
                    let feedback = this.feedbackInput.value; 
            
                    let updatingFeedback = null;
                    if (updatingFeedback) {
                        updatingFeedback.content = feedback;
                        updatingFeedback.score = this.scoreActive;
            
                        localStorage.setItem("feedbacks", JSON.stringify(this.listFeedback));
            
                        this.feedbackInput.value = "";
                        updatingFeedback = null;
            
                        this.feedbackInput.focus();
            
                        this.renderListFeedback();
                        this.handleAverageRating();
                    } else {
                        let newFeedback = {
                            feedbackId: uuidv4(),
                            score: this.scoreActive,
                            content: feedback,
                        };
            
                        this.listFeedback.push(newFeedback);
                        localStorage.setItem("feedbacks", JSON.stringify(this.listFeedback));
            
                        this.renderListFeedback();
                        this.handleAverageRating();
            
                        this.feedbackInput.value = "";
                    }
            
                    this.reviewNumber.innerHTML = this.listFeedback.length.toString();
            
                    this.btnSend.classList.remove("btn-dark");
             
        });
    }
    
    
    private validateData(): void {
        let feedback = this.feedbackInput.value;
        this.feedbackInput.addEventListener("input", (e) => {
            if (!(e.target as HTMLInputElement).value.trim()) {
                this.error.style.display = "block";
                this.btnSend.classList.remove("btn-dark");
            } else {
                feedback = (e.target as HTMLInputElement).value;
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
function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }