using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NestInn.API.Models
{
    public class PropertyImage
    {
        [Key]
        public int ImageId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        public int DisplayOrder { get; set; } // 1 to 5

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

       
        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;
    }
}