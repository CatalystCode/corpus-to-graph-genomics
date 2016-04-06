/****** Object:  UserDefinedTableType [dbo].[UDT_DocIdList]    Script Date: 3/29/2016 3:47:54 PM ******/
CREATE TYPE [dbo].[UDT_DocIdList] AS TABLE(
	[SourceId] [int] NULL,
	[DocId] [int] NULL
)
GO
/****** Object:  UserDefinedTableType [dbo].[UDT_EntityList]    Script Date: 3/29/2016 3:47:55 PM ******/
CREATE TYPE [dbo].[UDT_EntityList] AS TABLE(
	[TypeId] [int] NULL,
	[Id] [varchar](50) NULL,
	[Name] [varchar](50) NULL
)
GO
/****** Object:  UserDefinedTableType [dbo].[UDT_Relations]    Script Date: 3/29/2016 3:47:55 PM ******/
CREATE TYPE [dbo].[UDT_Relations] AS TABLE(
	[ScoringServiceId] [varchar](50) NULL,
	[ModelVersion] [varchar](50) NULL,
	[Entity1TypeId] [int] NULL,
	[Entity1Id] [varchar](50) NULL,
	[Entity2TypeId] [int] NULL,
	[Entity2Id] [varchar](50) NULL,
	[Relation] [varchar](50) NULL,
	[Score] [real] NULL,
	[Json] [varchar](1024) NULL
)
GO
/****** Object:  Table [dbo].[Documents]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Documents](
	[SourceId] [int] NOT NULL,
	[Id] [int] NOT NULL,
	[Description] [varchar](1024) NULL,
	[StatusId] [int] NOT NULL,
	[Timestamp] [datetime] NOT NULL,
 CONSTRAINT [PK_Documents_1] PRIMARY KEY CLUSTERED 
(
	[SourceId] ASC,
	[Id] ASC
)
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[DocumentStatus]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[DocumentStatus](
	[Id] [int] NOT NULL,
	[Name] [varchar](50) NOT NULL,
 CONSTRAINT [PK_DocumentStatus] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Entities]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Entities](
	[TypeId] [int] NOT NULL,
	[Id] [varchar](50) NOT NULL,
	[Name] [varchar](50) NOT NULL,
 CONSTRAINT [PK_Entities] PRIMARY KEY CLUSTERED 
(
	[TypeId] ASC,
	[Id] ASC
)
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[EntityTypes]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[EntityTypes](
	[Id] [int] NOT NULL,
	[Name] [varchar](50) NOT NULL,
 CONSTRAINT [PK_ConceptTypes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Feedback]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Feedback](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Json] [text] NOT NULL,
 CONSTRAINT [PK_Feedback] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[GenesInfo]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[GenesInfo](
	[GeneId] [varchar](50) NULL,
	[HgId] [varchar](1024) NULL,
	[HgName] [varchar](50) NULL,
	[HgSymbol] [varchar](1024) NULL,
	[Description] [varchar](1024) NULL,
	[Summary] [varchar](1024) NULL
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Relations]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Relations](
	[SourceId] [int] NOT NULL,
	[DocId] [int] NOT NULL,
	[SentenceIndex] [int] NOT NULL,
	[ScoringServiceId] [nvarchar](50) NOT NULL,
	[ModelVersion] [varchar](50) NOT NULL,
	[Entity1TypeId] [int] NOT NULL,
	[Entity1Id] [varchar](50) NOT NULL,
	[Entity2TypeId] [int] NOT NULL,
	[Entity2Id] [varchar](50) NOT NULL,
	[Relation] [varchar](50) NOT NULL,
	[Score] [real] NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[Json] [varchar](1024) NOT NULL,
 CONSTRAINT [PK_Relations] PRIMARY KEY CLUSTERED 
(
	[SourceId] ASC,
	[DocId] ASC,
	[SentenceIndex] ASC,
	[ScoringServiceId] ASC,
	[ModelVersion] ASC,
	[Entity1TypeId] ASC,
	[Entity1Id] ASC,
	[Entity2TypeId] ASC,
	[Entity2Id] ASC
)
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Sentences]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sentences](
	[SourceId] [int] NOT NULL,
	[DocId] [int] NOT NULL,
	[SentenceIndex] [int] NOT NULL,
	[Sentence] [text] NOT NULL,
	[MentionsJson] [text] NOT NULL,
 CONSTRAINT [PK_Sentences] PRIMARY KEY CLUSTERED 
(
	[SourceId] ASC,
	[DocId] ASC,
	[SentenceIndex] ASC
)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Sources]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Sources](
	[Id] [int] NOT NULL,
	[name] [varchar](50) NOT NULL,
	[Url] [varchar](1024) NULL,
 CONSTRAINT [PK_Sources] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
ALTER TABLE [dbo].[Documents] ADD  CONSTRAINT [DF_Documents_StatusId]  DEFAULT ((1)) FOR [StatusId]
GO
ALTER TABLE [dbo].[Documents] ADD  CONSTRAINT [DF_Documents_Timestamp]  DEFAULT (getutcdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Documents]  WITH CHECK ADD  CONSTRAINT [FK_Documents_DocumentStatus] FOREIGN KEY([StatusId])
REFERENCES [dbo].[DocumentStatus] ([Id])
GO
ALTER TABLE [dbo].[Documents] CHECK CONSTRAINT [FK_Documents_DocumentStatus]
GO
ALTER TABLE [dbo].[Documents]  WITH CHECK ADD  CONSTRAINT [FK_Documents_Sources] FOREIGN KEY([SourceId])
REFERENCES [dbo].[Sources] ([Id])
GO
ALTER TABLE [dbo].[Documents] CHECK CONSTRAINT [FK_Documents_Sources]
GO
ALTER TABLE [dbo].[Entities]  WITH CHECK ADD  CONSTRAINT [FK_Entities_EntityTypes] FOREIGN KEY([TypeId])
REFERENCES [dbo].[EntityTypes] ([Id])
GO
ALTER TABLE [dbo].[Entities] CHECK CONSTRAINT [FK_Entities_EntityTypes]
GO
ALTER TABLE [dbo].[Relations]  WITH CHECK ADD  CONSTRAINT [FK_Relations_Entities_1] FOREIGN KEY([Entity1TypeId], [Entity1Id])
REFERENCES [dbo].[Entities] ([TypeId], [Id])
GO
ALTER TABLE [dbo].[Relations] CHECK CONSTRAINT [FK_Relations_Entities_1]
GO
ALTER TABLE [dbo].[Relations]  WITH CHECK ADD  CONSTRAINT [FK_Relations_Entities_2] FOREIGN KEY([Entity2TypeId], [Entity2Id])
REFERENCES [dbo].[Entities] ([TypeId], [Id])
GO
ALTER TABLE [dbo].[Relations] CHECK CONSTRAINT [FK_Relations_Entities_2]
GO
ALTER TABLE [dbo].[Relations]  WITH CHECK ADD  CONSTRAINT [FK_Relations_Sentences] FOREIGN KEY([SourceId], [DocId], [SentenceIndex])
REFERENCES [dbo].[Sentences] ([SourceId], [DocId], [SentenceIndex])
GO
ALTER TABLE [dbo].[Relations] CHECK CONSTRAINT [FK_Relations_Sentences]
GO
ALTER TABLE [dbo].[Sentences]  WITH CHECK ADD  CONSTRAINT [FK_Sentences_Documents] FOREIGN KEY([SourceId], [DocId])
REFERENCES [dbo].[Documents] ([SourceId], [Id])
GO
ALTER TABLE [dbo].[Sentences] CHECK CONSTRAINT [FK_Sentences_Documents]
GO
/****** Object:  StoredProcedure [dbo].[AddFeedback]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[AddFeedback]
	@Json text
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [dbo].[Feedback]
			   ([Json])
		 VALUES
			   (@Json)

END

GO
/****** Object:  StoredProcedure [dbo].[FilterExistingDocuments]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		amitu
-- Description:	Filter document Ids, returning Ids that are not found

/*
-- define an instance of your user-defined table type
DECLARE @udtIds UDT_IdList

-- fill some values into that table
INSERT INTO @udtIds VALUES('One'), ('Two'), ('Three'), ('aaaaa1')

-- call your stored proc
DECLARE @return_value int
EXEC    @return_value = [FilterExistingDocuments]
        @Ids = @udtIds   -- pass in that UDT table type here!

-- SELECT  'Return Value' = @return_value
GO
*/

-- =============================================
CREATE PROCEDURE [dbo].[FilterExistingDocuments]
	@Docs UDT_DocIdList READONLY
AS
BEGIN

	SET NOCOUNT ON;
	
	SELECT i.SourceId as 'sourceId', i.DocId as 'docId' FROM @Docs i
	LEFT JOIN Documents d
	ON d.SourceId = i.SourceId AND d.Id = i.DocId
	WHERE d.Id IS NULL

END







GO
/****** Object:  StoredProcedure [dbo].[GetDocuments]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetDocuments]
	@Offset bigint,
	@BatchSize bigint,
	@Timestamp datetime
AS
BEGIN

	select * from Documents
	where [Timestamp] <= @Timestamp AND StatusId <= 3 -- all documents that are not in a NOT_ACCESSIBLE (4) status
	order by SourceID, Id
	OFFSET @Offset ROWS
	FETCH NEXT @BatchSize ROWS ONLY 

END


GO
/****** Object:  StoredProcedure [dbo].[GetEntitiesGenericNames]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[GetEntitiesGenericNames]
	--@entities UDT_EntityList READONLY
AS
/*
BEGIN
	
	
	DECLARE @GenericNameStart VARCHAR(50)
	DECLARE @GenericNameEnd VARCHAR(50)
	SET @GenericNameStart = 'AAVARENTITY'
	SET @GenericNameEnd = 'AA'
	
	DECLARE @GenericName VARCHAR(100)

	
	
	DECLARE @GenericNameIndex int

	CREATE TABLE #LocalTempTable (
		TypeId int,
		Id varchar(50), 
		GenericName varchar(50))
		
	DECLARE @CURSOR_TypeId int
	DECLARE @CURSOR_Id int
	DECLARE @CURSOR_Name VARCHAR(50)

	DECLARE @TypeId int
	DECLARE @Id int
	DECLARE @Name VARCHAR(50)


	SET NOCOUNT ON;

	BEGIN TRANSACTION T1
	SET IDENTITY_INSERT Entities ON

	DECLARE @Cursor CURSOR
	SET @Cursor =	CURSOR FOR 
					SELECT TypeId, Id, Name 
					FROM @entities

	OPEN @Cursor 
	FETCH NEXT FROM @Cursor 
	INTO @CURSOR_TypeId, @CURSOR_Id, @CURSOR_Name

	WHILE @@FETCH_STATUS = 0
	BEGIN
			
		

		-- check if we already have this entity
		SELECT @TypeId = TypeId, @Id = Id, @GenericName = GenericName
		FROM Entities
		WHERE TypeId = @CURSOR_TypeId AND Id = @CURSOR_Id

		-- if entity isn't exist- add it
		IF @TypeId IS NULL AND @Id IS NULL
		BEGIN
			SET @GenericNameIndex = (SELECT MAX(GenericNameIndex) FROM Entities)
			IF @GenericNameIndex IS NULL
				SET @GenericNameIndex = 1
			SET @GenericNameIndex = @GenericNameIndex + 1

			SET @GenericName = CONCAT(@GenericNameStart, CONVERT(varchar(10), @GenericNameIndex), @GenericNameEnd)

			SET @TypeId = @CURSOR_TypeId
			SET @Id = @CURSOR_Id
			SET @Name = @CURSOR_Name

			INSERT INTO Entities (TypeId, Id, Name, GenericNameIndex, GenericName)
			VALUES (@TypeId, @Id, @Name, @GenericNameIndex, @GenericName)
		END

		INSERT INTO #LocalTempTable 
		VALUES (@TypeId, @Id, @GenericName)
		
		SET @TypeId = NULL
		SET @Id = NULL
		
		FETCH NEXT FROM @Cursor 
		INTO @CURSOR_TypeId, @CURSOR_Id, @CURSOR_Name

	END

	CLOSE @Cursor
	DEALLOCATE @Cursor
	
	SET IDENTITY_INSERT Entities OFF
	COMMIT TRANSACTION T1
	

	SELECT * FROM #LocalTempTable
	
END
*/


GO
/****** Object:  StoredProcedure [dbo].[GetGraph]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetGraph]
	@ScoringServiceId varchar(50),
	@ModelVersion varchar(50)
AS
BEGIN
	
	SET NOCOUNT ON;

	-- get relevant entities
	select distinct e.* from Entities e
	join (select distinct Entity1TypeId, Entity1Id, Entity2TypeId, Entity2Id from Relations WHERE ScoringServiceId = @ScoringServiceId AND ModelVersion = @ModelVersion) i
	on (e.TypeId = i.Entity1TypeId AND e.Id = i.Entity1Id) OR (e.TypeId = i.Entity2TypeId AND e.Id = i.Entity2Id)


	-- get relevant relations
	select s.Sentence, r.SourceId, r.DocId, r.SentenceIndex, r.Entity1TypeId, r.Entity1Id, r.Entity2TypeId, r.Entity2Id, r.Relation, r.Score, r.[Json]
	from Sentences s 
	join Relations r 
	on s.SourceId = r.SourceId AND s.DocId = r.DocId AND s.SentenceIndex = r.SentenceIndex
	join Entities e1
	on r.Entity1TypeId = e1.TypeId AND r.Entity1Id = e1.Id
	join Entities e2
	on r.Entity2TypeId = e2.TypeId AND r.Entity2Id = e2.Id
	where r.ScoringServiceId = @ScoringServiceId AND r.ModelVersion = @ModelVersion
	order by r.SourceId, r.DocId, r.SentenceIndex


END


GO
/****** Object:  StoredProcedure [dbo].[GetGraphModelVersions]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetGraphModelVersions]
AS
BEGIN

select distinct ScoringServiceId, ModelVersion
from relations
order by ScoringServiceId, ModelVersion ASC

END


GO
/****** Object:  StoredProcedure [dbo].[GetSentences]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetSentences]
	@Offset bigint,
	@BatchSize bigint,
	@Timestamp datetime
AS
BEGIN

	-- get last fully process document
	--declare @Timestamp datetime = (select max(TimeStamp) from Documents where StatusId = 3)

	select s.* from Sentences s
	join Documents d
	on d.[Timestamp] <= @Timestamp AND s.SourceId = d.SourceId AND s.DocId = d.Id
	order by s.SourceID, s.DocId, s.SentenceIndex
	OFFSET @Offset ROWS 
	FETCH NEXT @BatchSize ROWS ONLY 

END


GO
/****** Object:  StoredProcedure [dbo].[UpdateDocumentStatus]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateDocumentStatus]
	@SourceId int,
	@DocId VARCHAR(50),
	@StatusId int
AS
BEGIN

	SET NOCOUNT ON;
	
	UPDATE Documents
	SET StatusId = @StatusId
	WHERE Id = @DocId

END






GO
/****** Object:  StoredProcedure [dbo].[UpsertDocument]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		amitu
-- Description:	Merge a document
-- =============================================
CREATE PROCEDURE [dbo].[UpsertDocument]
	@SourceId int,
	@Id int,
	@Description varchar(1024),
	@StatusId int
AS
BEGIN

	SET NOCOUNT ON;

	DECLARE @Timestamp DATETIME = GETUTCDATE()

	MERGE 
	   Documents
	USING ( 
		VALUES (@SourceId, @Id, @Description, @StatusId)
	) AS source (SourceId, Id, Description, StatusId) 
	ON Documents.SourceId = source.SourceId AND Documents.Id = source.Id 
	WHEN MATCHED THEN
	   UPDATE SET Description = source.Description, StatusId = source.StatusId, [TimeStamp] = @Timestamp
	WHEN NOT MATCHED THEN
	   INSERT (SourceId, Id, Description, StatusId, [Timestamp])
	   VALUES (SourceId, Id, Description, StatusId, @Timestamp)
	; --A MERGE statement must be terminated by a semi-colon (;).

END


GO
/****** Object:  StoredProcedure [dbo].[UpsertEntities]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[UpsertEntities]
	@entities UDT_EntityList READONLY
AS
BEGIN

	SET NOCOUNT ON;

	BEGIN TRANSACTION T1
	--SET IDENTITY_INSERT Entities ON

	MERGE Entities
	USING ( SELECT e.TypeId, e.Id, e.Name FROM @entities e) 
	AS source (TypeId, Id, Name) 
	ON	Entities.TypeId = source.TypeId 
		AND Entities.Id = source.Id 
	WHEN NOT MATCHED THEN
	   INSERT (TypeId, Id, Name)
	   VALUES (TypeId, Id, Name)
	; --A MERGE statement must be terminated by a semi-colon (;).
	
	--SET IDENTITY_INSERT Entities OFF
	COMMIT TRANSACTION T1
	
END




GO
/****** Object:  StoredProcedure [dbo].[UpsertRelations]    Script Date: 3/29/2016 3:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		amitu
-- Description:	Merge a sentence relations
-- =============================================
CREATE PROCEDURE [dbo].[UpsertRelations]
	@SourceId int,
    @DocId varchar(50),
    @SentenceIndex int,
    @entities UDT_EntityList READONLY,
	@relations UDT_Relations READONLY,
    @Sentence text,
	@MentionsJson text

AS
BEGIN

	SET NOCOUNT ON;
	BEGIN TRANSACTION T1

	-- TODO REMOVE AFTER IMPLEMENTATION
	/*
	IF NOT EXISTS (SELECT * FROM Documents WHERE Id = @DocId)
	BEGIN
		INSERT INTO Documents VALUES (@SourceId, @DocId, 'temporary record', 1)
	END
	*/

	IF NOT EXISTS (SELECT * FROM Sentences WHERE SourceId = @SourceId AND DocId = @DocId AND SentenceIndex = @SentenceIndex)
	BEGIN
		INSERT INTO Sentences VALUES (@SourceId, @DocId, @SentenceIndex, @Sentence, @MentionsJson)
	END
	
	
	MERGE Entities
	USING ( SELECT e.TypeId, e.Id, e.Name FROM @entities e) 
	AS source (TypeId, Id, Name) 
	ON	Entities.TypeId = source.TypeId 
		AND Entities.Id = source.Id 
	WHEN NOT MATCHED THEN
	   INSERT (TypeId, Id, Name)
	   VALUES (TypeId, Id, Name)
	; --A MERGE statement must be terminated by a semi-colon (;).


	/*
	-- delete previous relations for this sentence if any
	-- this is a workaround. better do it with cursor dynamically over select unique ScoringServiceIDs
	DELETE FROM Relations
	WHERE SourceId = @SourceId 
		AND DocId = @DocId 
		AND SentenceIndex = @SentenceIndex
		AND ScoringServiceId = 'TLC'
		AND ModelVersion in (SELECT DISTINCT ModelVersion FROM @relations WHERE ScoringServiceId = 'TLC')

	DELETE FROM Relations
	WHERE SourceId = @SourceId 
		AND DocId = @DocId 
		AND SentenceIndex = @SentenceIndex
		AND ScoringServiceId = 'SK'
		AND ModelVersion in (SELECT DISTINCT ModelVersion FROM @relations WHERE ScoringServiceId = 'SK')
	

	-- insert updated relations
	INSERT INTO Relations 
	SELECT @SourceId, @DocId, @SentenceIndex, r.ScoringServiceId, r.ModelVersion, r.Entity1TypeId, r.Entity1Id, r.Entity2TypeId, r.Entity2Id, r.Relation, r.Score
	FROM @relations r
	*/

	DECLARE @Timestamp DATETIME = GETUTCDATE()

	MERGE Relations 
	USING ( SELECT @SourceId, @DocId, @SentenceIndex, r.ScoringServiceId, r.ModelVersion, r.Entity1TypeId, r.Entity1Id, r.Entity2TypeId, r.Entity2Id, r.Relation, r.Score, r.[Json]
			FROM @relations r) 
	AS source (SourceId, DocId, SentenceIndex, ScoringServiceId, ModelVersion, Entity1TypeId, Entity1Id, Entity2TypeId, Entity2Id, Relation, Score, [Json]) 
	ON	Relations.SourceId = source.SourceId 
		AND Relations.DocId = source.DocId 
		AND Relations.SentenceIndex = source.SentenceIndex
		AND Relations.ScoringServiceId = source.ScoringServiceId
		AND Relations.ModelVersion = source.ModelVersion
		AND Relations.Entity1TypeId = source.Entity1TypeId
		AND Relations.Entity1Id = source.Entity1Id
		AND Relations.Entity2TypeId = source.Entity2TypeId
		AND Relations.Entity2Id = source.Entity2Id
	WHEN MATCHED THEN
	   UPDATE SET Relation = source.Relation, Score = source.Score, [Timestamp] = @Timestamp, [Json] = source.[Json]
	WHEN NOT MATCHED THEN
	   INSERT (SourceId, DocId, SentenceIndex, ScoringServiceId, ModelVersion, Entity1TypeId, Entity1Id, Entity2TypeId, Entity2Id, Relation, Score, [Timestamp], [Json])
	   VALUES (SourceId, DocId, SentenceIndex, ScoringServiceId, ModelVersion, Entity1TypeId, Entity1Id, Entity2TypeId, Entity2Id, Relation, Score, @Timestamp, [Json])
	; --A MERGE statement must be terminated by a semi-colon (;).
	

	COMMIT TRANSACTION T1

	RETURN 1;

END


GO

INSERT INTO DocumentStatus (Id,Name) VALUES (1, 'Processing')
INSERT INTO DocumentStatus (Id,Name) VALUES (2, 'Scoring')
INSERT INTO DocumentStatus (Id,Name) VALUES (3, 'Processed')
INSERT INTO DocumentStatus (Id,Name) VALUES (4, 'NotAccessible')

INSERT INTO Sources (Id ,name ,Url) VALUES (1, 'Pubmed', 'http://pubmed.com')
INSERT INTO Sources (Id ,name ,Url) VALUES (2, 'PMC', 'http://pmc.com')

INSERT INTO EntityTypes (Id, Name) VALUES (1, 'Gene')
INSERT INTO EntityTypes (Id, Name) VALUES (2, 'Mirna')
INSERT INTO EntityTypes (Id, Name) VALUES (3, 'Species')
INSERT INTO EntityTypes (Id, Name) VALUES (4, 'Chemical')
INSERT INTO EntityTypes (Id, Name) VALUES (5, 'Other')

